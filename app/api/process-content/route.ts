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
    maxVideos: payload.maxVideos ? Number(payload.maxVideos) : undefined,
    selectionMode: payload.selectionMode ?? "latest50"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid YouTube source request", details: parsed.error.flatten() }, { status: 400 });
  }

  const plan = createProcessingPlan(parsed.data);

  return NextResponse.json({
    status: "queued",
    message:
      "This source is valid and ready to queue. Full title, transcript, caption, and video-list checks will run after the YouTube and Supabase processing jobs are connected.",
    plan
  });
}
