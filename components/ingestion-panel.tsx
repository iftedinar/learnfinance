"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { mergeLearningAnalysis, readLearningAnalysis, saveLearningAnalysis } from "@/lib/client-learning-store";
import type { LearningAnalysis } from "@/lib/learning-materials";
import { detectSourceType, splitUrls } from "@/lib/youtube-source";

type ProcessingResult = {
  status: string;
  message: string;
  plan: {
    sourceType: string;
    acceptedUrlCount: number;
    maxVideos: number;
    selectionMode: string;
    sourceChecks: Array<{
      url: string;
      sourceType: string;
      availableNow: string[];
      requiredForProcessing: string[];
      missingUntilConnected: string[];
    }>;
    steps: string[];
    nextUserAction: string;
  };
  analysis?: LearningAnalysis;
};

export function IngestionPanel() {
  const [urls, setUrls] = useState("");
  const [maxVideos, setMaxVideos] = useState(50);
  const [selectionMode, setSelectionMode] = useState("latest50");
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [result, setResult] = useState<ProcessingResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsedUrls = useMemo(() => splitUrls(urls), [urls]);
  const sourceType = parsedUrls.length ? detectSourceType(parsedUrls) : "mixed";

  async function queueProcessing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setResult(undefined);

    if (parsedUrls.length === 0) {
      setError("Paste at least one YouTube video, playlist, or channel URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/process-content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceType,
          urls: parsedUrls,
          includeTranscript,
          maxVideos,
          selectionMode
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not validate this source.");
      }

      setResult(payload);
      if (payload.analysis) {
        saveLearningAnalysis(mergeLearningAnalysis(readLearningAnalysis(), payload.analysis));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not queue this source.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Add YouTube Source</h2>
          <p className="mt-1 text-sm text-muted-foreground">Paste one or two direct YouTube video URLs to extract learning materials. Channel and playlist imports are planned next.</p>
        </div>
        <span className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">Detected: {sourceType}</span>
      </div>

      <form className="mt-4 space-y-4" onSubmit={queueProcessing}>
        <label className="block">
          <span className="text-sm font-medium">YouTube URLs</span>
          <textarea
            name="urls"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            placeholder="Example: https://www.youtube.com/watch?v=..."
            className="mt-2 min-h-36 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">Channel or playlist range</span>
            <select
              value={selectionMode}
              onChange={(event) => setSelectionMode(event.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            >
              <option value="latest50">Most recent videos</option>
              <option value="first50">First videos</option>
              <option value="mostViewed50">Most viewed videos</option>
              <option value="playlist">Playlist order</option>
              <option value="all">All available videos</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Max videos</span>
            <input
              name="maxVideos"
              type="number"
              min={1}
              max={500}
              value={maxVideos}
              onChange={(event) => setMaxVideos(Number(event.target.value))}
              className="mt-2 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-end gap-3 rounded-md border border-border p-3">
            <input
              name="includeTranscript"
              type="checkbox"
              checked={includeTranscript}
              onChange={(event) => setIncludeTranscript(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Fetch transcripts when available</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Analyzing Video" : "Analyze Video"}
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
            <h3 className="font-semibold">{result.status === "processed" ? "Analysis Complete" : "Import Needs Direct Video URLs"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
          </div>
          {result.analysis ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Saved {result.analysis.videos.length} video analysis result{result.analysis.videos.length === 1 ? "" : "s"}, {result.analysis.strategies.length} strategies/concepts, and {result.analysis.glossaryTerms.length} glossary terms. Open the Videos, Strategies, and Glossary tabs to study them.
            </div>
          ) : null}
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <SummaryItem label="Source type" value={result.plan.sourceType} />
            <SummaryItem label="URLs accepted" value={result.plan.acceptedUrlCount} />
            <SummaryItem label="Video limit" value={result.plan.maxVideos} />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Source checks</h4>
            <div className="mt-2 space-y-2">
              {result.plan.sourceChecks.map((check) => (
                <div key={check.url} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <span className="break-all font-medium">{check.url}</span>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{check.sourceType}</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Available now: {check.availableNow.join(", ")}. Needed during processing: {check.requiredForProcessing.join(", ")}.
                  </p>
                  <p className="mt-1 text-muted-foreground">Will check after API connection: {check.missingUntilConnected.join(", ")}.</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Next steps</h4>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              {result.plan.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">{result.plan.nextUserAction}</p>
          </div>
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
