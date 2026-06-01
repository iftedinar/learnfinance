export type ProcessingStatus = "queued" | "processing" | "processed" | "transcript_missing" | "failed";

export type SourceType = "channel" | "video" | "playlist" | "mixed";

export type Channel = {
  id: string;
  name: string;
  url: string;
  youtubeChannelId: string;
  status: ProcessingStatus;
  videoCount: number;
  strategyCount: number;
  topics: string[];
};

export type Video = {
  id: string;
  channelId: string;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  publishedAt: string;
  transcriptStatus: ProcessingStatus;
  summary: string;
  keyConcepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
};

export type Strategy = {
  id: string;
  channelId: string;
  videoId: string;
  name: string;
  marketType: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  setup: string;
  indicators: string[];
  entryRules: string[];
  exitRules: string[];
  stopLossRules: string[];
  riskManagement: string[];
  example: string;
  mistakes: string[];
  checklist: string[];
};

export type Note = {
  id: string;
  title: string;
  body: string;
  sourceLabel: string;
  updatedAt: string;
};
