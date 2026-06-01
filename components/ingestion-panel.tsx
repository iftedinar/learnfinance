"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { detectSourceType } from "@/lib/youtube-source";

export function IngestionPanel() {
  const [urls, setUrls] = useState("https://www.youtube.com/@samplemarketeducation\nhttps://www.youtube.com/watch?v=sample-risk");
  const [maxVideos, setMaxVideos] = useState(50);
  const parsedUrls = useMemo(() => urls.split(/\s+/).map((url) => url.trim()).filter(Boolean), [urls]);
  const sourceType = parsedUrls.length ? detectSourceType(parsedUrls) : "channel";

  return (
    <Card>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Add YouTube Source</h2>
          <p className="mt-1 text-sm text-muted-foreground">Paste one video, multiple videos, a playlist, or a channel URL.</p>
        </div>
        <span className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">Detected: {sourceType}</span>
      </div>

      <form className="mt-4 space-y-4" action="/api/process-content" method="post">
        <input type="hidden" name="sourceType" value={sourceType} />
        <label className="block">
          <span className="text-sm font-medium">YouTube URLs</span>
          <textarea
            name="urls"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            className="mt-2 min-h-36 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Max videos from channel or playlist</span>
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
            <input name="includeTranscript" type="checkbox" defaultChecked className="h-4 w-4" />
            <span className="text-sm">Fetch transcripts when available</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Queue Processing
          </button>
          <a href="/api/export?format=doc" className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
            Download Word Doc
          </a>
          <a href="/api/export?format=pdf" className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
            Download PDF
          </a>
        </div>
      </form>
    </Card>
  );
}
