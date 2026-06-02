"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import { clearLearningAnalysis, readLearningAnalysis } from "@/lib/client-learning-store";
import { emptyLearningAnalysis, type LearningAnalysis } from "@/lib/learning-materials";

export function LearningDashboard() {
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Analyzed videos</p>
          <p className="mt-2 text-3xl font-semibold">{analysis.videos.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Strategies and concepts</p>
          <p className="mt-2 text-3xl font-semibold">{analysis.strategies.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Glossary terms</p>
          <p className="mt-2 text-3xl font-semibold">{analysis.glossaryTerms.length}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Learning Materials</h2>
          <div className="flex items-center gap-2">
            <Badge tone="info">Knowledge MVP</Badge>
            {analysis.videos.length ? (
              <button onClick={clearLearningAnalysis} className="rounded-md border border-red-200 px-3 py-1 text-sm font-semibold text-red-700">
                Reset
              </button>
            ) : null}
          </div>
        </div>
        {analysis.videos.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No resources have been analyzed yet. Add a YouTube video, article URL, webpage, or pasted notes, then the extracted summaries, study guide, concepts, and glossary terms will appear here and in the library tabs.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {analysis.videos.map((video) => (
              <div key={video.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{video.title}</p>
                  <Badge tone={video.transcriptStatus === "processed" ? "success" : "warning"}>{video.transcriptStatus.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{video.summary}</p>
                {video.sourceHealth.missing.length ? (
                  <p className="mt-2 text-sm text-amber-700">Missing: {video.sourceHealth.missing.join(", ")}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
