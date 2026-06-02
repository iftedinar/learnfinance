"use client";

import { useMemo, useState } from "react";
import type { LearningAnalysis } from "@/lib/learning-materials";

export function AiChatPanel({ analysis, title = "Ask AI About This Material" }: { analysis: LearningAnalysis; title?: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const context = useMemo(() => buildContext(analysis), [analysis]);

  async function ask() {
    if (!question.trim()) {
      return;
    }
    setIsLoading(true);
    setAnswer("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, context })
      });
      const payload = await response.json();
      setAnswer(payload.answer ?? "No answer returned.");
    } catch {
      setAnswer("Chat failed. Check the API key and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 md:flex-row">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about the summary, strategy, term, quiz, or risk warning"
          className="min-w-0 flex-1 rounded-md border border-border bg-background p-3 text-sm"
        />
        <button onClick={ask} disabled={isLoading} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {isLoading ? "Asking" : "Ask"}
        </button>
      </div>
      {answer ? <div className="mt-4 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">{answer}</div> : null}
    </section>
  );
}

function buildContext(analysis: LearningAnalysis) {
  return [
    ...analysis.videos.map((video) => [
      `Resource: ${video.title}`,
      `Summary: ${video.summary}`,
      `Main ideas: ${video.materials.mainIdeas.join("; ")}`,
      `Study guide: ${video.materials.studyGuide.join("; ")}`,
      `Warnings: ${video.materials.warnings.join("; ")}`
    ].join("\n")),
    ...analysis.strategies.map((strategy) => `Strategy/concept: ${strategy.name}\n${strategy.setup}\nChecklist: ${strategy.checklist.join("; ")}`),
    ...analysis.glossaryTerms.map((term) => `Term: ${term.term} = ${term.definition}`)
  ].join("\n\n");
}
