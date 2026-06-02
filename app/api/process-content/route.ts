import { NextResponse } from "next/server";
import { extractKnowledge } from "@/lib/server-knowledge-extraction";
import { splitUrls } from "@/lib/youtube-source";

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const urls = Array.isArray(payload.urls)
    ? payload.urls.map(String).filter(Boolean)
    : splitUrls(typeof payload.urls === "string" ? payload.urls : "");
  const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";

  if (urls.length === 0 && !notes) {
    return NextResponse.json(
      {
        status: "empty_source",
        message: "Paste a YouTube video URL, article/webpage URL, or notes to extract learning materials."
      },
      { status: 400 }
    );
  }

  try {
    const analysis = await extractKnowledge({ urls, notes });
    return NextResponse.json({
      status: "processed",
      message:
        "Knowledge extraction finished. Results are saved in this browser and available in the Videos, Strategies, and Glossary tabs.",
      analysis
    });
  } catch (caught) {
    return NextResponse.json(
      {
        status: "failed",
        message: caught instanceof Error ? caught.message : "Knowledge extraction failed."
      },
      { status: 422 }
    );
  }
}

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }

  return Object.fromEntries((await request.formData()).entries());
}
