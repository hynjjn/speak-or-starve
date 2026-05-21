/**
 * Speaking-mission grader.
 *
 * For now this is a stub: it accepts a transcript (typed in by the player) and
 * compares it to the target phrase using a normalized Levenshtein ratio.
 *
 * Later, swap `gradeUtterance` for a real call to a speech-to-text / scoring
 * API (Whisper, Azure Speech, ElevenLabs, etc.) — keep the return shape stable
 * so the UI does not need to change.
 */

export type GradeResult = {
  score: number; // 0..1
  passed: boolean;
  message: string;
};

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
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
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
  };
}

/**
 * Placeholder for a future API call.
 * Replace the body with a fetch() to your scoring endpoint when ready.
 */
export async function gradeUtteranceAsync(
  transcript: string,
  target: string,
): Promise<GradeResult> {
  // TODO: const res = await fetch("/api/grade", { method: "POST", body: ... });
  return gradeUtterance(transcript, target);
}
