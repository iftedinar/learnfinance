"use client";

import { useEffect, useState } from "react";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { Card, PageHeader } from "@/components/ui";
import { readLearningAnalysis } from "@/lib/client-learning-store";
import { emptyLearningAnalysis, type LearningAnalysis } from "@/lib/learning-materials";

export default function SimulationsPage() {
  const [analysis, setAnalysis] = useState<LearningAnalysis>(emptyLearningAnalysis);

  useEffect(() => {
    const refresh = () => setAnalysis(readLearningAnalysis());
    refresh();
    window.addEventListener("learn-finance-analysis-updated", refresh);
    return () => window.removeEventListener("learn-finance-analysis-updated", refresh);
  }, []);

  const quizzes = analysis.videos.flatMap((video) => (video.materials.quizQuestions ?? []).map((quiz) => ({ ...quiz, source: video.title })));
  const simulations = analysis.videos.flatMap((video) => (video.materials.simulationPrompts ?? []).map((simulation) => ({ ...simulation, source: video.title })));

  return (
    <>
      <PageHeader title="Quizzes and Simulations" description="Practice questions and scenario prompts generated from your extracted resources." />
      {!quizzes.length && !simulations.length ? (
        <Card>
          <h2 className="text-lg font-semibold">No quizzes or simulations yet</h2>
          <p className="mt-2 text-muted-foreground">Extract a resource with a valid OpenAI key. The app will generate quizzes and scenario prompts from the material.</p>
        </Card>
      ) : null}

      {quizzes.length ? (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Quiz Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={`${quiz.source}-${quiz.question}`}>
                <p className="text-xs text-muted-foreground">{quiz.source}</p>
                <h3 className="mt-2 font-semibold">{quiz.question}</h3>
                <ul className="mt-3 list-inside list-disc text-sm text-muted-foreground">
                  {quiz.choices.map((choice) => <li key={choice}>{choice}</li>)}
                </ul>
                <p className="mt-3 text-sm"><strong>Answer:</strong> {quiz.answer}</p>
                <p className="mt-1 text-sm text-muted-foreground">{quiz.explanation}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {simulations.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Simulation Prompts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {simulations.map((simulation) => (
              <Card key={`${simulation.source}-${simulation.title}`}>
                <p className="text-xs text-muted-foreground">{simulation.source}</p>
                <h3 className="mt-2 font-semibold">{simulation.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{simulation.scenario}</p>
                <p className="mt-3 text-sm"><strong>Best answer:</strong> {simulation.answer}</p>
                <p className="mt-1 text-sm text-muted-foreground">{simulation.explanation}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
      <AiChatPanel analysis={analysis} title="Ask AI About These Practice Questions" />
    </>
  );
}
