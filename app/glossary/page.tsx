"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { readLearningAnalysis } from "@/lib/client-learning-store";
import { emptyLearningAnalysis, type LearningAnalysis } from "@/lib/learning-materials";

export default function GlossaryPage() {
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
      <PageHeader title="Glossary" description="Finance and trading terms extracted from analyzed videos." />
      {analysis.glossaryTerms.length === 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">No glossary terms yet</h2>
          <p className="mt-2 text-muted-foreground">Analyze a video from the Dashboard. Important terms and plain-English definitions will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {analysis.glossaryTerms.map((term) => {
            const sourceVideo = analysis.videos.find((video) => video.id === term.videoId);
            return (
              <Card key={term.id}>
                <h2 className="text-lg font-semibold">{term.term}</h2>
                <p className="mt-2 text-muted-foreground">{term.definition}</p>
                <p className="mt-3 text-xs text-muted-foreground">Source: {sourceVideo?.title ?? "Unknown video"}</p>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
