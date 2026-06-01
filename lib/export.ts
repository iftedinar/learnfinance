import type { Note, Strategy, Video } from "@/lib/types";

export type ExportPayload = {
  title: string;
  notes: Note[];
  videos: Video[];
  strategies: Strategy[];
};

export function renderExportHtml(payload: ExportPayload) {
  const sections = [
    `<h1>${escapeHtml(payload.title)}</h1>`,
    "<p><strong>Disclaimer:</strong> Educational use only. This is not financial advice.</p>",
    "<h2>Saved Notes</h2>",
    payload.notes
      .map((note) => `<article><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.body)}</p><p><em>${escapeHtml(note.sourceLabel)}</em></p></article>`)
      .join(""),
    "<h2>Video Summaries</h2>",
    payload.videos
      .map((video) => `<article><h3>${escapeHtml(video.title)}</h3><p>${escapeHtml(video.summary)}</p><p>${escapeHtml(video.youtubeUrl)}</p></article>`)
      .join(""),
    "<h2>Strategies</h2>",
    payload.strategies
      .map(
        (strategy) => `
          <article>
            <h3>${escapeHtml(strategy.name)}</h3>
            <p><strong>Market:</strong> ${escapeHtml(strategy.marketType)} | <strong>Difficulty:</strong> ${strategy.difficulty}</p>
            <p>${escapeHtml(strategy.setup)}</p>
            <p><strong>Risk:</strong> ${escapeHtml(strategy.riskManagement.join("; "))}</p>
            <p><strong>Checklist:</strong> ${escapeHtml(strategy.checklist.join("; "))}</p>
          </article>`
      )
      .join("")
  ];

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(payload.title)}</title>
  <style>body{font-family:Arial,sans-serif;line-height:1.5;color:#17202a;margin:40px}article{border-top:1px solid #d8dee4;padding:14px 0}h1,h2,h3{color:#0f4c3a}</style>
  </head><body>${sections.join("")}</body></html>`;
}

export function renderSimplePdf(payload: ExportPayload) {
  const text = [
    payload.title,
    "Educational use only. This is not financial advice.",
    "",
    "Saved Notes",
    ...payload.notes.flatMap((note) => [note.title, note.body, `Source: ${note.sourceLabel}`, ""]),
    "Video Summaries",
    ...payload.videos.flatMap((video) => [video.title, video.summary, video.youtubeUrl, ""]),
    "Strategies",
    ...payload.strategies.flatMap((strategy) => [
      strategy.name,
      `Market: ${strategy.marketType}; Difficulty: ${strategy.difficulty}`,
      strategy.setup,
      `Risk: ${strategy.riskManagement.join("; ")}`,
      ""
    ])
  ].join("\n");

  return createPdfBuffer(text);
}

function createPdfBuffer(text: string) {
  const escapedLines = text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .split("\n")
    .slice(0, 120);
  const content = ["BT", "/F1 11 Tf", "50 780 Td", "14 TL", ...escapedLines.map((line) => `(${line.slice(0, 95)}) Tj T*`), "ET"].join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char];
  });
}
