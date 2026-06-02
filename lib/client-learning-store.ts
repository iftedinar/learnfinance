"use client";

import { emptyLearningAnalysis, learningStoreKey, savedLearningStoreKey, type LearningAnalysis, type LearningVideo } from "@/lib/learning-materials";

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

export function clearLearningAnalysis() {
  window.localStorage.removeItem(learningStoreKey);
  window.dispatchEvent(new Event("learn-finance-analysis-updated"));
}

export function removeLearningResource(resourceId: string) {
  const current = readLearningAnalysis();
  saveLearningAnalysis({
    videos: current.videos.filter((video) => video.id !== resourceId),
    strategies: current.strategies.filter((strategy) => strategy.videoId !== resourceId),
    glossaryTerms: current.glossaryTerms.filter((term) => term.videoId !== resourceId),
    updatedAt: new Date().toISOString()
  });
}

export function readSavedResources(): LearningVideo[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(savedLearningStoreKey);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as LearningVideo[];
  } catch {
    return [];
  }
}

export function saveResourceToNotes(resource: LearningVideo) {
  const saved = readSavedResources();
  const merged = new Map(saved.map((item) => [item.id, item]));
  merged.set(resource.id, resource);
  window.localStorage.setItem(savedLearningStoreKey, JSON.stringify([...merged.values()]));
  window.dispatchEvent(new Event("learn-finance-saved-updated"));
}

export function removeSavedResource(resourceId: string) {
  window.localStorage.setItem(savedLearningStoreKey, JSON.stringify(readSavedResources().filter((resource) => resource.id !== resourceId)));
  window.dispatchEvent(new Event("learn-finance-saved-updated"));
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
