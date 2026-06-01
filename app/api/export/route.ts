import { NextResponse } from "next/server";
import { notes, strategies, videos } from "@/lib/mock-data";
import { renderExportHtml, renderSimplePdf } from "@/lib/export";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "doc";
  const payload = {
    title: "Finance Learning Agent Saved Content",
    notes,
    videos,
    strategies
  };

  if (format === "pdf") {
    return new NextResponse(renderSimplePdf(payload), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="finance-learning-agent.pdf"'
      }
    });
  }

  return new NextResponse(renderExportHtml(payload), {
    headers: {
      "content-type": "application/msword; charset=utf-8",
      "content-disposition": 'attachment; filename="finance-learning-agent.doc"'
    }
  });
}
