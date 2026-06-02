"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { ResourceActions } from "@/components/resource-actions";
import { Card, PageHeader } from "@/components/ui";
import { readLearningAnalysis } from "@/lib/client-learning-store";
import { emptyLearningAnalysis, type LearningAnalysis } from "@/lib/learning-materials";

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<LearningAnalysis>(emptyLearningAnalysis);
  const resourceId = decodeURIComponent(params.id);
  const resource = analysis.videos.find((video) => video.id === resourceId);
  const strategies = useMemo(() => analysis.strategies.filter((strategy) => strategy.videoId === resourceId), [analysis.strategies, resourceId]);
  const terms = useMemo(() => analysis.glossaryTerms.filter((term) => term.videoId === resourceId), [analysis.glossaryTerms, resourceId]);

  useEffect(() => {
    const refresh = () => setAnalysis(readLearningAnalysis());
    refresh();
    window.addEventListener("learn-finance-analysis-updated", refresh);
    return () => window.removeEventListener("learn-finance-analysis-updated", refresh);
  }, []);

  if (!resource) {
    return (
      <>
        <PageHeader title="Resource Not Found" description="This resource is not in browser storage anymore." />
        <Card>
          <Link href="/videos" className="text-accent">Back to Resource Library</Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title={resource.title} description="Study guide, quiz questions, simulations, glossary terms, and strategy/framework notes extracted from this resource." />
      <Card>
        <p className="text-sm text-muted-foreground">{resource.channelTitle ?? resource.sourceType ?? "Resource"} | {resource.transcriptStatus.replace("_", " ")}</p>
        <p className="mt-4 text-muted-foreground">{resource.summary}</p>
        <ResourceActions resource={resource} />
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Section title="Main Ideas" items={resource.materials.mainIdeas} />
        <Section title="Study Guide" items={resource.materials.studyGuide} />
        <Section title="Practice Tasks" items={resource.materials.actionItems} />
        <Section title="Warnings" items={resource.materials.warnings} />
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Quiz Questions</h2>
        <div className="mt-3 grid gap-3">
          {(resource.materials.quizQuestions ?? []).length ? resource.materials.quizQuestions?.map((quiz) => (
            <div key={quiz.question} className="rounded-md border border-border p-3">
              <p className="font-semibold">{quiz.question}</p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {quiz.choices.map((choice) => <li key={choice}>{choice}</li>)}
              </ul>
              <p className="mt-2 text-sm"><strong>Answer:</strong> {quiz.answer}</p>
              <p className="mt-1 text-sm text-muted-foreground">{quiz.explanation}</p>
            </div>
          )) : <p className="text-muted-foreground">No quiz questions generated for this resource yet.</p>}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Simulation Prompts</h2>
        <div className="mt-3 grid gap-3">
          {(resource.materials.simulationPrompts ?? []).length ? resource.materials.simulationPrompts?.map((simulation) => (
            <div key={simulation.title} className="rounded-md border border-border p-3">
              <p className="font-semibold">{simulation.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{simulation.scenario}</p>
              <p className="mt-2 text-sm"><strong>Best answer:</strong> {simulation.answer}</p>
              <p className="mt-1 text-sm text-muted-foreground">{simulation.explanation}</p>
            </div>
          )) : <p className="text-muted-foreground">No simulation prompts generated for this resource yet.</p>}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Strategies and Concepts</h2>
        <div className="mt-3 grid gap-3">
          {strategies.length ? strategies.map((strategy) => (
            <div key={strategy.id} className="rounded-md border border-border p-3">
              <p className="font-semibold">{strategy.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{strategy.setup}</p>
            </div>
          )) : <p className="text-muted-foreground">No strategies or frameworks extracted.</p>}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Glossary</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {terms.length ? terms.map((term) => (
            <div key={term.id}>
              <p className="font-semibold">{term.term}</p>
              <p className="text-sm text-muted-foreground">{term.definition}</p>
            </div>
          )) : <p className="text-muted-foreground">No glossary terms extracted.</p>}
        </div>
      </Card>
      <AiChatPanel
        analysis={{
          videos: [resource],
          strategies,
          glossaryTerms: terms,
          updatedAt: analysis.updatedAt
        }}
        title="Ask AI About This Resource"
      />
    </>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length ? (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : <p className="mt-2 text-sm text-muted-foreground">No items extracted.</p>}
    </Card>
  );
}
