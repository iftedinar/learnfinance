"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { ResourceActions } from "@/components/resource-actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { readLearningAnalysis } from "@/lib/client-learning-store";
import { emptyLearningAnalysis, type LearningAnalysis } from "@/lib/learning-materials";

export default function VideosPage() {
  const [analysis, setAnalysis] = useState<LearningAnalysis>(emptyLearningAnalysis);

  useEffect(() => {
    const refresh = () => setAnalysis(readLearningAnalysis());
    refresh();
    window.addEventListener("learn-finance-analysis-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("learn-finance-analysis-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <>
      <PageHeader title="Resource Library" description="Review analyzed videos, articles, notes, summaries, source checks, and study materials." />
      {analysis.videos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {analysis.videos.map((video) => (
            <Card key={video.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link className="text-xl font-semibold text-accent" href={`/resources/${encodeURIComponent(video.id)}`}>
                    {video.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {video.channelTitle ?? "Unknown channel"} {video.publishedAt ? `| ${new Date(video.publishedAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={video.transcriptStatus === "processed" ? "success" : "warning"}>{video.transcriptStatus.replace("_", " ")}</Badge>
                  <Badge>{video.difficulty}</Badge>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">{video.summary}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <MaterialList title="Main Ideas" items={video.materials.mainIdeas} />
                <MaterialList title="Study Guide" items={video.materials.studyGuide} />
                <MaterialList title="Practice Tasks" items={video.materials.actionItems} />
                <MaterialList title="Risk and Accuracy Warnings" items={video.materials.warnings} />
              </div>

              <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                <strong>Source check:</strong>{" "}
                {video.sourceHealth.missing.length
                  ? `Missing ${video.sourceHealth.missing.join(", ")}.`
                  : "Title, publish date, and transcript were available."}{" "}
                Transcript characters: {video.sourceHealth.transcriptCharacterCount}.
              </div>
              <ResourceActions resource={video} />
            </Card>
          ))}
        </div>
      )}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Search Saved Content</h2>
        <input className="mt-3 w-full rounded-md border border-border bg-background p-3 text-sm" placeholder="Search will be connected after saved analysis moves from browser storage to Supabase." />
      </Card>
      <AiChatPanel analysis={analysis} title="Ask AI About Your Resources" />
    </>
  );
}

function EmptyState() {
  return (
    <Card>
      <h2 className="text-lg font-semibold">No analyzed resources yet</h2>
      <p className="mt-2 text-muted-foreground">
        Add a YouTube video, article URL, webpage, or pasted notes on the Dashboard. After extraction, this page will show summaries, study materials, key concepts, and source health.
      </p>
    </Card>
  );
}

function MaterialList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No items extracted.</p>
      )}
    </div>
  );
}
