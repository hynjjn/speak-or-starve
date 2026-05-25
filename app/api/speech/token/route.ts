export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json(
      { error: "AZURE_SPEECH_KEY or AZURE_SPEECH_REGION is not configured." },
      { status: 500 },
    );
  }

  try {
    const tokenRes = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Length": "0",
        },
        cache: "no-store",
      },
    );

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return Response.json(
        {
          error: "Failed to issue Azure Speech token.",
          status: tokenRes.status,
          detail: body,
        },
        { status: 500 },
      );
    }

    const token = await tokenRes.text();
    return Response.json({ token, region });
  } catch (err) {
    return Response.json(
      {
        error: "Network error while issuing token.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
