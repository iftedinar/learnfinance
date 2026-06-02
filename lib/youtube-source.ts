import { z } from "zod";
import type { SourceType } from "@/lib/types";

export const sourceSelectionModes = [
  "single",
  "all",
  "first50",
  "latest50",
  "mostViewed50",
  "playlist"
] as const;

export const sourceRequestSchema = z.object({
  sourceType: z.enum(["channel", "video", "playlist", "mixed"]),
  urls: z.array(z.string().url()).min(1).max(100),
  includeTranscript: z.boolean().default(true),
  maxVideos: z.number().int().positive().max(500).optional(),
  selectionMode: z.enum(sourceSelectionModes).default("latest50")
});

export type SourceRequest = z.infer<typeof sourceRequestSchema>;

export function detectSourceType(urls: string[]): SourceType {
  const types = new Set(urls.map(classifyYoutubeUrl).filter(isSourceType));
  if (types.size === 1) {
    return [...types][0];
  }
  return "mixed";
}

function isSourceType(value: SourceType | undefined): value is SourceType {
  return Boolean(value);
}

export function classifyYoutubeUrl(url: string): SourceType | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname;

  if (!["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
    return undefined;
  }

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
  const isVideoOnly = sourceType === "video";
  const maxVideos = isVideoOnly ? Math.min(request.urls.length, 2) : request.maxVideos ?? 50;

  return {
    sourceType,
    acceptedUrlCount: request.urls.length,
    maxVideos,
    selectionMode: isVideoOnly ? "single or supplied videos" : request.selectionMode,
    sourceChecks: request.urls.map((url) => ({
      url,
      sourceType: classifyYoutubeUrl(url) ?? "unsupported",
      availableNow: ["source URL", "detected source type"],
      requiredForProcessing: ["video title", "YouTube video id", "publish date", "transcript or captions", "source channel"],
      missingUntilConnected: [
        "video title",
        "publish date",
        "transcript availability",
        "captions language",
        "view count for most-viewed sorting"
      ]
    })),
    steps: [
      "Validate YouTube source URLs",
      sourceType === "channel"
        ? `Fetch channel metadata and ${describeSelectionMode(request.selectionMode, maxVideos)}`
        : sourceType === "playlist"
          ? `Fetch playlist videos, limited to ${maxVideos}`
          : "Fetch supplied video metadata",
      "Show which videos have title, publish date, transcript, and captions available",
      "Fetch transcript when available",
      "Chunk transcript and create embeddings",
      "Generate summaries, strategies, glossary terms, and simulations",
      "Save content for search, chat, and export"
    ],
    nextUserAction:
      "After import, review the Videos page, select one or more videos to study, then generate summaries, strategies, glossary terms, simulations, and notes from those selected videos."
  };
}

export function splitUrls(value: string) {
  return value
    .split(/[\s,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function describeSelectionMode(selectionMode: SourceRequest["selectionMode"], maxVideos: number) {
  const descriptions: Record<SourceRequest["selectionMode"], string> = {
    single: "one selected video",
    all: "all available videos",
    first50: `the first ${maxVideos} videos`,
    latest50: `the latest ${maxVideos} videos`,
    mostViewed50: `the most viewed ${maxVideos} videos`,
    playlist: `playlist videos, limited to ${maxVideos}`
  };

  return descriptions[selectionMode];
}
