/**
 * Speaking-mission grader.
 *
 * Speech recognition + pronunciation assessment runs in the browser via the
 * Azure Cognitive Services Speech SDK. This module owns:
 *
 *   - shared types (GradeResult + Azure score/word shapes)
 *   - score aggregation across utterances
 *   - the thematic message + pass/fail decision derived from Azure's scores
 *
 * The Levenshtein helpers are kept around as a typed-input fallback for tests
 * and for when AZURE_SPEECH_KEY is not configured.
 */

export type WordBreakdown = {
  word: string;
  accuracy?: number;
  errorType?: "None" | "Mispronunciation" | "Omission" | "Insertion" | string;
};

export type OverallScores = {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
  pronunciation: number;
};

export type GradeResult = {
  score: number; // 0..1 (Pronunciation / 100)
  passed: boolean;
  message: string;
  transcript?: string;
  detail?: {
    scores: OverallScores;
    words: WordBreakdown[];
  };
};

// Azure JSON payloads are loosely typed — only the fields we read are narrowed.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AzureWord = {
  Word?: string;
  PronunciationAssessment?: {
    AccuracyScore?: number;
    ErrorType?: string;
  };
  [k: string]: any;
};

export type AzureNBest = {
  Display?: string;
  Words?: AzureWord[];
  PronunciationAssessment?: {
    AccuracyScore?: number;
    FluencyScore?: number;
    CompletenessScore?: number;
    ProsodyScore?: number;
    PronScore?: number;
  };
  [k: string]: any;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export type Utterance = { text: string; nbest: AzureNBest };

const PASS_THRESHOLD = 70; // Pronunciation score on Azure's 0–100 scale.

export function aggregateUtterances(utts: Utterance[]): {
  scores: OverallScores;
  words: WordBreakdown[];
  transcript: string;
} {
  const allWords: WordBreakdown[] = [];
  const sums = {
    accuracy: 0,
    fluency: 0,
    completeness: 0,
    prosody: 0,
    pronunciation: 0,
  };
  let scored = 0;

  for (const { nbest } of utts) {
    if (Array.isArray(nbest?.Words)) {
      for (const w of nbest.Words) {
        allWords.push({
          word: String(w?.Word ?? ""),
          accuracy: w?.PronunciationAssessment?.AccuracyScore,
          errorType: w?.PronunciationAssessment?.ErrorType,
        });
      }
    }
    const pa = nbest?.PronunciationAssessment;
    if (pa && typeof pa.AccuracyScore === "number") {
      sums.accuracy += pa.AccuracyScore;
      sums.fluency += pa.FluencyScore ?? 0;
      sums.completeness += pa.CompletenessScore ?? 0;
      sums.prosody += pa.ProsodyScore ?? 0;
      sums.pronunciation += pa.PronScore ?? 0;
      scored++;
    }
  }

  const denom = Math.max(scored, 1);
  return {
    scores: {
      accuracy: sums.accuracy / denom,
      fluency: sums.fluency / denom,
      completeness: sums.completeness / denom,
      prosody: sums.prosody / denom,
      pronunciation: sums.pronunciation / denom,
    },
    words: allWords,
    transcript: utts
      .map((u) => u.text)
      .join(" ")
      .trim(),
  };
}

export function gradeFromUtterances(utts: Utterance[]): GradeResult {
  if (utts.length === 0) {
    return {
      score: 0,
      passed: false,
      message: "* (silence echoes back.)",
      transcript: "",
    };
  }
  const { scores, words, transcript } = aggregateUtterances(utts);
  const passed = scores.pronunciation >= PASS_THRESHOLD;
  return {
    score: scores.pronunciation / 100,
    passed,
    message: passed
      ? "* The watch chimes — your voice carries."
      : "* The words come out wrong. The wind eats them.",
    transcript,
    detail: { scores, words },
  };
}

/* -- legacy typed-input fallback (kept for tests / no-key environments) -- */

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[a.length][b.length];
}

export function gradeUtterance(transcript: string, target: string): GradeResult {
  const a = normalize(transcript);
  const b = normalize(target);
  if (!a) {
    return { score: 0, passed: false, message: "* (silence echoes back.)" };
  }
  const dist = levenshtein(a, b);
  const len = Math.max(a.length, b.length);
  const score = Math.max(0, 1 - dist / len);
  const passed = score >= 0.78;
  return {
    score,
    passed,
    message: passed
      ? "* The watch chimes — your voice carries."
      : "* The words come out wrong. The wind eats them.",
    transcript,
  };
}
