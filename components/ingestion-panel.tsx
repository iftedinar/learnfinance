"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
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
  const [result, setResult] = useState<ProcessingResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsedUrls = useMemo(() => splitUrls(urls), [urls]);

  async function extractSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setResult(undefined);

    if (parsedUrls.length === 0 && !notes.trim()) {
      setError("Paste a YouTube video URL, article/webpage URL, or notes.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/process-content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          urls: parsedUrls,
          notes
        })
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

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Extracting Knowledge" : "Extract Knowledge"}
          </button>
          <a href="/api/export?format=doc" className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
            Download Word Doc
          </a>
          <a href="/api/export?format=pdf" className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
            Download PDF
          </a>
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

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
