"use client";

import { emptyLearningAnalysis, learningStoreKey, type LearningAnalysis } from "@/lib/learning-materials";

export function readLearningAnalysis(): LearningAnalysis {
  if (typeof window === "undefined") {
    return emptyLearningAnalysis;
  }

  const stored = window.localStorage.getItem(learningStoreKey);
  if (!stored) {
    return emptyLearningAnalysis;
  }

  try {
    return JSON.parse(stored) as LearningAnalysis;
  } catch {
    return emptyLearningAnalysis;
  }
}

export function saveLearningAnalysis(nextAnalysis: LearningAnalysis) {
  window.localStorage.setItem(learningStoreKey, JSON.stringify(nextAnalysis));
  window.dispatchEvent(new Event("learn-finance-analysis-updated"));
}

export function mergeLearningAnalysis(current: LearningAnalysis, incoming: LearningAnalysis): LearningAnalysis {
  return {
    videos: upsertById(current.videos, incoming.videos),
    strategies: upsertById(current.strategies, incoming.strategies),
    glossaryTerms: upsertById(current.glossaryTerms, incoming.glossaryTerms),
    updatedAt: new Date().toISOString()
  };
}

function upsertById<T extends { id: string }>(current: T[], incoming: T[]) {
  const merged = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    merged.set(item.id, item);
  }
  return [...merged.values()];
}
