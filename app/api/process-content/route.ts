import { NextResponse } from "next/server";
import { analyzeYoutubeVideos } from "@/lib/server-video-analysis";
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

  if (plan.sourceType !== "video") {
    return NextResponse.json({
      status: "needs_video_urls",
      message:
        "For the first working version, paste one or two direct YouTube video URLs. Channel and playlist imports will be added after the video analyzer is stable.",
      plan
    });
  }

  let analysis;
  try {
    analysis = await analyzeYoutubeVideos(parsed.data.urls);
  } catch (caught) {
    return NextResponse.json(
      {
        status: "failed",
        message: caught instanceof Error ? caught.message : "Video analysis failed.",
        plan
      },
      { status: 422 }
    );
  }

  return NextResponse.json({
    status: "processed",
    message:
      "Video analysis finished. Results were extracted from the transcript when available; otherwise the app marks the output as metadata-only.",
    plan,
    analysis
  });
}
