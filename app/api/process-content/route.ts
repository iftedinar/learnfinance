import { NextResponse } from "next/server";
import { createProcessingPlan, sourceRequestSchema } from "@/lib/youtube-source";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const urls = typeof payload.urls === "string" ? payload.urls.split(/\s+/).filter(Boolean) : payload.urls;
  const parsed = sourceRequestSchema.safeParse({
    sourceType: payload.sourceType ?? "mixed",
    urls,
    includeTranscript: payload.includeTranscript === "on" || payload.includeTranscript === true,
    maxVideos: payload.maxVideos ? Number(payload.maxVideos) : undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid YouTube source request", details: parsed.error.flatten() }, { status: 400 });
  }

  const plan = createProcessingPlan(parsed.data);

  return NextResponse.json({
    status: "queued",
    message: "Processing plan created. Wire this route to YouTube Data API, transcript fetching, embeddings, and Supabase job storage.",
    plan
  });
}
