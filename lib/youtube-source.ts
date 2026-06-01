import { z } from "zod";
import type { SourceType } from "@/lib/types";

export const sourceRequestSchema = z.object({
  sourceType: z.enum(["channel", "video", "playlist", "mixed"]),
  urls: z.array(z.string().url()).min(1).max(100),
  includeTranscript: z.boolean().default(true),
  maxVideos: z.number().int().positive().max(500).optional()
});

export type SourceRequest = z.infer<typeof sourceRequestSchema>;

export function detectSourceType(urls: string[]): SourceType {
  const types = new Set(urls.map(classifyYoutubeUrl));
  if (types.size === 1) {
    return [...types][0];
  }
  return "mixed";
}

export function classifyYoutubeUrl(url: string): SourceType {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname;

  if (parsed.searchParams.has("list")) {
    return "playlist";
  }

  if (host === "youtu.be" || path.startsWith("/watch") || path.startsWith("/shorts/")) {
    return "video";
  }

  if (path.startsWith("/@") || path.startsWith("/channel/") || path.startsWith("/c/") || path.startsWith("/user/")) {
    return "channel";
  }

  return "video";
}

export function createProcessingPlan(request: SourceRequest) {
  const sourceType = request.sourceType === "mixed" ? detectSourceType(request.urls) : request.sourceType;

  return {
    sourceType,
    acceptedUrlCount: request.urls.length,
    maxVideos: request.maxVideos ?? (sourceType === "video" ? request.urls.length : 50),
    steps: [
      "Validate YouTube source URLs",
      sourceType === "channel" ? "Fetch channel metadata and video list" : "Fetch supplied video metadata",
      "Fetch transcript when available",
      "Chunk transcript and create embeddings",
      "Generate summaries, strategies, glossary terms, and simulations",
      "Save content for search, chat, and export"
    ]
  };
}
