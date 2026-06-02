"use client";

import { useEffect, useState } from "react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { readLearningAnalysis } from "@/lib/client-learning-store";
import { emptyLearningAnalysis, type LearningAnalysis } from "@/lib/learning-materials";

export default function StrategiesPage() {
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
      <PageHeader title="Strategy Library" description="Strategies, frameworks, and investing concepts extracted from analyzed videos." />
      {analysis.strategies.length === 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">No strategies or concepts extracted yet</h2>
          <p className="mt-2 text-muted-foreground">Analyze a direct YouTube video URL from the Dashboard. If the video contains strategy rules or finance frameworks, they will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analysis.strategies.map((strategy) => {
            const sourceVideo = analysis.videos.find((video) => video.id === strategy.videoId);
            return (
              <Card key={strategy.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{strategy.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Source: {sourceVideo?.title ?? "Unknown video"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="info">{strategy.marketType}</Badge>
                      <Badge>{strategy.difficulty}</Badge>
                      {strategy.indicators.map((indicator) => <Badge key={indicator}>{indicator}</Badge>)}
                    </div>
                  </div>
                </div>
                <p className="mt-4">{strategy.setup}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <RuleList title="Entry or Decision Rules" items={strategy.entryRules} />
                  <RuleList title="Exit or Review Rules" items={strategy.exitRules} />
                  <RuleList title="Stop Loss or Invalidation" items={strategy.stopLossRules} />
                  <RuleList title="Risk Management" items={strategy.riskManagement} />
                </div>
                <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                  <strong>Example:</strong> {strategy.example}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function RuleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No rules extracted.</p>
      )}
    </div>
  );
}
