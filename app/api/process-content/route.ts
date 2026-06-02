import { NextResponse } from "next/server";
import { extractKnowledge } from "@/lib/server-knowledge-extraction";
import { splitUrls } from "@/lib/youtube-source";

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const urls = Array.isArray(payload.urls)
    ? payload.urls.map(String).filter(Boolean)
    : splitUrls(typeof payload.urls === "string" ? payload.urls : "");
  const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";
  const files = Array.isArray(payload.files) ? payload.files : [];

  if (urls.length === 0 && !notes && files.length === 0) {
    return NextResponse.json(
      {
        status: "empty_source",
        message: "Paste a YouTube video URL, article/webpage URL, notes, or upload a supported file to extract learning materials."
      },
      { status: 400 }
    );
  }

  try {
    const analysis = await extractKnowledge({ urls, notes, files });
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

  const formData = await request.formData();
  const files = await parseUploadedFiles(formData.getAll("files"));
  return {
    urls: formData.get("urls") ?? "",
    notes: formData.get("notes") ?? "",
    files
  };
}

async function parseUploadedFiles(items: FormDataEntryValue[]) {
  const files = items.filter((item): item is File => typeof item !== "string").slice(0, 2);
  const parsed: Array<{ name: string; text: string }> = [];

  for (const file of files) {
    if (file.size > 4 * 1024 * 1024) {
      continue;
    }

    const name = file.name || "uploaded-file";
    const lowerName = name.toLowerCase();

    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: await file.arrayBuffer() });
      const result = await parser.getText();
      parsed.push({ name, text: result.text });
      continue;
    }

    if (file.type.startsWith("text/") || [".txt", ".md", ".markdown", ".html", ".htm", ".csv"].some((extension) => lowerName.endsWith(extension))) {
      parsed.push({ name, text: await file.text() });
    }
  }

  return parsed;
}
