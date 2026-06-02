"use client";

import type { LearningAnalysis, LearningVideo } from "@/lib/learning-materials";

export function downloadAnalysisDoc(analysis: LearningAnalysis) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Learning Materials</title>
  <style>body{font-family:Arial,sans-serif;line-height:1.5;color:#17202a;margin:40px}h1,h2,h3{color:#0f4c3a}section{border-top:1px solid #d8dee4;padding:14px 0}li{margin:4px 0}</style>
  </head><body><h1>Finance Learning Materials</h1>${analysis.videos.map((resource) => renderResourceHtmlBody(resource, analysis.strategies.filter((strategy) => strategy.videoId === resource.id), analysis.glossaryTerms.filter((term) => term.videoId === resource.id))).join("")}</body></html>`;
  downloadBlob("finance-learning-materials.doc", "application/msword;charset=utf-8", html);
}

export function downloadAnalysisPdf(analysis: LearningAnalysis) {
  const text = analysis.videos.map((resource) => renderResourceText(resource, analysis)).join("\n\n---\n\n");
  downloadBlob("finance-learning-materials.pdf", "application/pdf", createSimplePdf(text || "No extracted materials yet."));
}

export function downloadResourceDoc(resource: LearningVideo, analysis: LearningAnalysis) {
  const html = renderResourceHtml(resource, analysis);
  downloadBlob(`${safeName(resource.title)}-study-guide.doc`, "application/msword;charset=utf-8", html);
}

export function downloadResourcePdf(resource: LearningVideo, analysis: LearningAnalysis) {
  const text = renderResourceText(resource, analysis);
  downloadBlob(`${safeName(resource.title)}-study-guide.pdf`, "application/pdf", createSimplePdf(text));
}

function renderResourceHtml(resource: LearningVideo, analysis: LearningAnalysis) {
  const strategies = analysis.strategies.filter((strategy) => strategy.videoId === resource.id);
  const terms = analysis.glossaryTerms.filter((term) => term.videoId === resource.id);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(resource.title)}</title>
  <style>body{font-family:Arial,sans-serif;line-height:1.5;color:#17202a;margin:40px}h1,h2,h3{color:#0f4c3a}section{border-top:1px solid #d8dee4;padding:14px 0}li{margin:4px 0}</style>
  </head><body>${renderResourceHtmlBody(resource, strategies, terms)}</body></html>`;
}

function renderResourceHtmlBody(resource: LearningVideo, strategies: LearningAnalysis["strategies"], terms: LearningAnalysis["glossaryTerms"]) {
  return [
    `<h1>${escapeHtml(resource.title)}</h1>`,
    `<p><strong>Source:</strong> ${escapeHtml(resource.youtubeUrl)}</p>`,
    `<p><strong>Status:</strong> ${resource.transcriptStatus.replace("_", " ")}</p>`,
    `<p><strong>Educational use only. This is not financial advice.</strong></p>`,
    section("Summary", `<p>${escapeHtml(resource.summary)}</p>`),
    section("Main Ideas", list(resource.materials.mainIdeas)),
    section("Study Guide", list(resource.materials.studyGuide)),
    section("Practice Tasks", list(resource.materials.actionItems)),
    section("Quiz Questions", quizList(resource.materials.quizQuestions ?? [])),
    section("Simulation Prompts", simulationList(resource.materials.simulationPrompts ?? [])),
    section("Strategies and Concepts", strategies.map((strategy) => `<h3>${escapeHtml(strategy.name)}</h3><p>${escapeHtml(strategy.setup)}</p>${list(strategy.checklist)}`).join("")),
    section("Glossary", terms.map((term) => `<p><strong>${escapeHtml(term.term)}:</strong> ${escapeHtml(term.definition)}</p>`).join("")),
    section("Warnings", list(resource.materials.warnings))
  ].join("");
}

function renderResourceText(resource: LearningVideo, analysis: LearningAnalysis) {
  const strategies = analysis.strategies.filter((strategy) => strategy.videoId === resource.id);
  const terms = analysis.glossaryTerms.filter((term) => term.videoId === resource.id);
  return [
    resource.title,
    `Source: ${resource.youtubeUrl}`,
    "Educational use only. This is not financial advice.",
    "",
    "Summary",
    resource.summary,
    "",
    "Main Ideas",
    ...resource.materials.mainIdeas,
    "",
    "Study Guide",
    ...resource.materials.studyGuide,
    "",
    "Practice Tasks",
    ...resource.materials.actionItems,
    "",
    "Quiz Questions",
    ...(resource.materials.quizQuestions ?? []).flatMap((quiz) => [quiz.question, `Answer: ${quiz.answer}`, quiz.explanation, ""]),
    "Simulation Prompts",
    ...(resource.materials.simulationPrompts ?? []).flatMap((simulation) => [simulation.title, simulation.scenario, `Answer: ${simulation.answer}`, simulation.explanation, ""]),
    "Strategies and Concepts",
    ...strategies.flatMap((strategy) => [strategy.name, strategy.setup, ...strategy.checklist, ""]),
    "Glossary",
    ...terms.map((term) => `${term.term}: ${term.definition}`),
    "",
    "Warnings",
    ...resource.materials.warnings
  ].join("\n");
}

function section(title: string, body: string) {
  return `<section><h2>${escapeHtml(title)}</h2>${body || "<p>No items extracted.</p>"}</section>`;
}

function list(items: string[]) {
  return items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>No items extracted.</p>";
}

function quizList(items: NonNullable<LearningVideo["materials"]["quizQuestions"]>) {
  return items.length
    ? items.map((quiz) => `<h3>${escapeHtml(quiz.question)}</h3>${list(quiz.choices)}<p><strong>Answer:</strong> ${escapeHtml(quiz.answer)}</p><p>${escapeHtml(quiz.explanation)}</p>`).join("")
    : "<p>No quiz questions generated.</p>";
}

function simulationList(items: NonNullable<LearningVideo["materials"]["simulationPrompts"]>) {
  return items.length
    ? items.map((simulation) => `<h3>${escapeHtml(simulation.title)}</h3><p>${escapeHtml(simulation.scenario)}</p>${list(simulation.choices)}<p><strong>Best answer:</strong> ${escapeHtml(simulation.answer)}</p><p>${escapeHtml(simulation.explanation)}</p>`).join("")
    : "<p>No simulation prompts generated.</p>";
}

function createSimplePdf(text: string) {
  const lines = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").split("\n").slice(0, 140);
  const content = ["BT", "/F1 10 Tf", "50 780 Td", "13 TL", ...lines.map((line) => `(${line.slice(0, 100)}) Tj T*`), "ET"].join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function downloadBlob(filename: string, type: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "resource";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char));
}
