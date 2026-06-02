"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { downloadAnalysisDoc, downloadAnalysisPdf } from "@/lib/client-export";
import { mergeLearningAnalysis, readLearningAnalysis, saveLearningAnalysis } from "@/lib/client-learning-store";
import type { LearningAnalysis } from "@/lib/learning-materials";
import { splitUrls } from "@/lib/youtube-source";

type ProcessingResult = {
  status: string;
  message: string;
  analysis?: LearningAnalysis;
};

export function IngestionPanel() {
  const [urls, setUrls] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileMessage, setFileMessage] = useState<string | undefined>();
  const [result, setResult] = useState<ProcessingResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsedUrls = useMemo(() => splitUrls(urls), [urls]);

  async function extractSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setResult(undefined);

    if (parsedUrls.length === 0 && !notes.trim() && files.length === 0) {
      setError("Paste a YouTube video URL, article/webpage URL, notes, or upload a supported file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = new FormData();
      body.set("urls", parsedUrls.join("\n"));
      body.set("notes", notes);
      for (const file of files) {
        body.append("files", file);
      }

      const response = await fetch("/api/process-content", {
        method: "POST",
        body
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? payload.error ?? "Could not extract this source.");
      }

      setResult(payload);
      if (payload.analysis) {
        saveLearningAnalysis(mergeLearningAnalysis(readLearningAnalysis(), payload.analysis));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not extract this source.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    setFileMessage(undefined);
    if (!files?.length) {
      setFiles([]);
      return;
    }

    const selected = [...files].slice(0, 2);
    const rejected = [...files].slice(2).map((file) => file.name);
    const acceptedFiles: File[] = [];

    for (const file of selected) {
      if (file.size > 4 * 1024 * 1024) {
        rejected.push(`${file.name} is larger than 4 MB`);
        continue;
      }
      if (!isSupportedFile(file)) {
        rejected.push(`${file.name} is not a supported PDF/text/html file`);
        continue;
      }
      acceptedFiles.push(file);
    }

    setFiles(acceptedFiles);
    setFileMessage([
      acceptedFiles.length ? `Ready to upload ${acceptedFiles.map((file) => file.name).join(", ")}.` : "",
      rejected.length ? `Skipped: ${rejected.join("; ")}.` : ""
    ].filter(Boolean).join(" "));
  }

  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold">Add Learning Source</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a YouTube video URL, article/webpage URL, or your own notes. The app extracts summaries, concepts, study points, glossary terms, and strategy/framework notes.
        </p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={extractSource}>
        <label className="block">
          <span className="text-sm font-medium">Source URLs</span>
          <textarea
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            placeholder="YouTube video or article URL. You can paste up to 2 URLs for now."
            className="mt-2 min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Pasted notes or text</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional: paste transcript text, article text, notes, or any finance learning material."
            className="mt-2 min-h-32 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block rounded-md border border-border p-3">
          <span className="text-sm font-medium">Upload files</span>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.md,.markdown,.html,.htm,.csv,.text,application/pdf,text/*"
            onChange={(event) => handleFiles(event.target.files)}
            className="mt-2 block w-full text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">Limit: 2 files, 4 MB each. Supported now: PDF, text, markdown, HTML, CSV. For scanned image PDFs, we will need OCR later.</p>
          {fileMessage ? <p className="mt-2 text-sm text-muted-foreground">{fileMessage}</p> : null}
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Extracting Knowledge" : "Extract Knowledge"}
          </button>
          <button type="button" onClick={() => downloadAnalysisDoc(readLearningAnalysis())} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
            Download Word Doc
          </button>
          <button type="button" onClick={() => downloadAnalysisPdf(readLearningAnalysis())} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
            Download PDF
          </button>
        </div>
      </form>

      {error ? <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

      {result ? (
        <div className="mt-5 space-y-4 rounded-md border border-border bg-background p-4">
          <div>
            <h3 className="font-semibold">Extraction Complete</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
          </div>
          {result.analysis ? (
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <SummaryItem label="Resources" value={result.analysis.videos.length} />
              <SummaryItem label="Strategies/concepts" value={result.analysis.strategies.length} />
              <SummaryItem label="Glossary terms" value={result.analysis.glossaryTerms.length} />
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function isSupportedFile(file: File) {
  const name = file.name.toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf") || file.type.startsWith("text/") || [".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".text"].some((extension) => name.endsWith(extension));
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
