import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";
import type { LearningAnalysis, LearningGlossaryTerm, LearningStrategy, LearningVideo } from "@/lib/learning-materials";

const maxVideosPerRequest = 2;
const maxTranscriptCharacters = 28000;

type YoutubeMetadata = {
  id: string;
  title: string;
  channelTitle?: string;
  publishedAt?: string;
  description?: string;
};

type ModelAnalysis = {
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  keyConcepts: string[];
  mainIdeas: string[];
  studyGuide: string[];
  actionItems: string[];
  warnings: string[];
  quizQuestions: Array<{ question: string; choices: string[]; answer: string; explanation: string }>;
  simulationPrompts: Array<{ title: string; scenario: string; choices: string[]; answer: string; explanation: string }>;
  strategies: Array<Omit<LearningStrategy, "id" | "videoId">>;
  glossaryTerms: Array<{ term: string; definition: string }>;
};

export async function analyzeYoutubeVideos(urls: string[]): Promise<LearningAnalysis> {
  const videoIds = unique(urls.map(extractYoutubeVideoId).filter(isString)).slice(0, maxVideosPerRequest);
  if (videoIds.length === 0) {
    throw new Error("Paste one or two direct YouTube video URLs. Channel and playlist expansion will be added after video analysis is stable.");
  }

  const videos: LearningVideo[] = [];
  const strategies: LearningStrategy[] = [];
  const glossaryTerms: LearningGlossaryTerm[] = [];

  for (const videoId of videoIds) {
    const metadata = await fetchYoutubeMetadata(videoId);
    const transcript = await fetchTranscript(videoId);
    const modelAnalysis = await analyzeWithOpenAI(metadata, transcript.text);
    const video = buildVideo(metadata, transcript, modelAnalysis);

    videos.push(video);
    strategies.push(
      ...modelAnalysis.strategies.map((strategy, index) => ({
        ...strategy,
        id: `${videoId}-strategy-${index + 1}`,
        videoId
      }))
    );
    glossaryTerms.push(
      ...modelAnalysis.glossaryTerms.map((term, index) => ({
        id: `${videoId}-term-${index + 1}`,
        videoId,
        term: term.term,
        definition: term.definition
      }))
    );
  }

  return {
    videos,
    strategies,
    glossaryTerms,
    updatedAt: new Date().toISOString()
  };
}

export function extractYoutubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0];
    }
    if (parsed.pathname.startsWith("/watch")) {
      return parsed.searchParams.get("v") ?? undefined;
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/").filter(Boolean)[1];
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/").filter(Boolean)[1];
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function fetchYoutubeMetadata(videoId: string): Promise<YoutubeMetadata> {
  const fallback = {
    id: videoId,
    title: `YouTube video ${videoId}`
  };

  if (!process.env.YOUTUBE_API_KEY) {
    return fallback;
  }

  const params = new URLSearchParams({
    part: "snippet",
    id: videoId,
    key: process.env.YOUTUBE_API_KEY
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);
  if (!response.ok) {
    return fallback;
  }

  const payload = await response.json();
  const item = payload.items?.[0];
  if (!item?.snippet) {
    return fallback;
  }

  return {
    id: videoId,
    title: item.snippet.title ?? fallback.title,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description
  };
}

async function fetchTranscript(videoId: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map((entry) => entry.text).join(" ").replace(/\s+/g, " ").trim();
    return {
      text: text.slice(0, maxTranscriptCharacters),
      hasTranscript: Boolean(text),
      characterCount: text.length
    };
  } catch {
    return {
      text: "",
      hasTranscript: false,
      characterCount: 0
    };
  }
}

async function analyzeWithOpenAI(metadata: YoutubeMetadata, transcript: string): Promise<ModelAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalysis(metadata, transcript);
  }

  const content = transcript || metadata.description || metadata.title;
  let raw: string | null | undefined;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract finance learning materials from YouTube transcript text. Return only valid JSON. Do not give financial advice, buy/sell signals, or guaranteed outcomes."
        },
        {
          role: "user",
          content: `Analyze this finance learning video for a beginner. If transcript text is missing, say the analysis is metadata-only and avoid pretending you saw the full video.

Title: ${metadata.title}
Channel: ${metadata.channelTitle ?? "Unknown"}
Published: ${metadata.publishedAt ?? "Unknown"}
Transcript available: ${transcript ? "yes" : "no"}

Content:
${content}

Return JSON with this exact shape:
{
  "summary": "short educational summary",
  "difficulty": "beginner",
  "keyConcepts": ["concept"],
  "mainIdeas": ["idea"],
  "studyGuide": ["what to study from this video"],
  "actionItems": ["paper practice or note-taking task"],
  "warnings": ["risk or accuracy warning"],
  "quizQuestions": [{"question": "question", "choices": ["A", "B", "C"], "answer": "A", "explanation": "why this is correct"}],
  "simulationPrompts": [{"title": "scenario title", "scenario": "scenario", "choices": ["choice"], "answer": "best answer", "explanation": "feedback"}],
  "strategies": [{
    "name": "strategy or concept name",
    "marketType": "stocks/options/crypto/forex/investing/personal finance/etc",
    "difficulty": "beginner",
    "setup": "setup description",
    "indicators": ["indicator or tool"],
    "entryRules": ["educational rule, not a signal"],
    "exitRules": ["educational rule"],
    "stopLossRules": ["risk control rule"],
    "riskManagement": ["risk rule"],
    "example": "simple hypothetical example",
    "mistakes": ["common mistake"],
    "checklist": ["checklist item"]
  }],
  "glossaryTerms": [{"term": "term", "definition": "plain English definition"}]
}`
        }
      ]
    });
    raw = response.choices[0]?.message.content;
  } catch {
    return fallbackAnalysis(metadata, transcript);
  }

  if (!raw) {
    return fallbackAnalysis(metadata, transcript);
  }

  try {
    return normalizeModelAnalysis(JSON.parse(raw));
  } catch {
    return fallbackAnalysis(metadata, transcript);
  }
}

function buildVideo(metadata: YoutubeMetadata, transcript: { hasTranscript: boolean; characterCount: number }, analysis: ModelAnalysis): LearningVideo {
  const missing = [
    metadata.title ? undefined : "title",
    metadata.publishedAt ? undefined : "publish date",
    transcript.hasTranscript ? undefined : "transcript or captions"
  ].filter(Boolean) as string[];

  return {
    id: metadata.id,
    title: metadata.title,
    youtubeUrl: `https://www.youtube.com/watch?v=${metadata.id}`,
    youtubeVideoId: metadata.id,
    channelTitle: metadata.channelTitle,
    publishedAt: metadata.publishedAt,
    transcriptStatus: transcript.hasTranscript ? "processed" : "metadata_only",
    summary: analysis.summary,
    keyConcepts: analysis.keyConcepts,
    difficulty: analysis.difficulty,
    materials: {
      mainIdeas: analysis.mainIdeas,
      studyGuide: analysis.studyGuide,
      actionItems: analysis.actionItems,
      warnings: analysis.warnings,
      quizQuestions: analysis.quizQuestions,
      simulationPrompts: analysis.simulationPrompts
    },
    sourceHealth: {
      hasTitle: Boolean(metadata.title),
      hasPublishDate: Boolean(metadata.publishedAt),
      hasTranscript: transcript.hasTranscript,
      transcriptCharacterCount: transcript.characterCount,
      missing
    }
  };
}

function fallbackAnalysis(metadata: YoutubeMetadata, transcript: string): ModelAnalysis {
  return {
    summary: transcript
      ? `Transcript was retrieved for "${metadata.title}", but AI analysis could not run. Add a valid OPENAI_API_KEY to generate structured learning materials.`
      : `Only metadata is available for "${metadata.title}". Add transcript access and OPENAI_API_KEY to generate full learning materials.`,
    difficulty: "beginner",
    keyConcepts: [],
    mainIdeas: [],
    studyGuide: transcript ? ["Review the transcript manually until AI analysis is available."] : ["Transcript is missing, so this cannot be accurately summarized yet."],
    actionItems: ["Confirm API keys are set in Vercel and restart/redeploy the app."],
    warnings: ["Do not treat metadata-only output as a full video summary."],
    quizQuestions: [],
    simulationPrompts: [],
    strategies: [],
    glossaryTerms: []
  };
}

function normalizeModelAnalysis(value: Partial<ModelAnalysis>): ModelAnalysis {
  return {
    summary: stringOr(value.summary, "No summary returned."),
    difficulty: difficultyOr(value.difficulty),
    keyConcepts: stringArray(value.keyConcepts),
    mainIdeas: stringArray(value.mainIdeas),
    studyGuide: stringArray(value.studyGuide),
    actionItems: stringArray(value.actionItems),
    warnings: stringArray(value.warnings),
    quizQuestions: Array.isArray(value.quizQuestions) ? value.quizQuestions.map(normalizeQuiz).slice(0, 8) : [],
    simulationPrompts: Array.isArray(value.simulationPrompts) ? value.simulationPrompts.map(normalizeSimulation).slice(0, 8) : [],
    strategies: Array.isArray(value.strategies) ? value.strategies.map(normalizeStrategy).slice(0, 8) : [],
    glossaryTerms: Array.isArray(value.glossaryTerms) ? value.glossaryTerms.map(normalizeGlossaryTerm).slice(0, 20) : []
  };
}

function normalizeQuiz(value: { question?: unknown; choices?: unknown; answer?: unknown; explanation?: unknown }) {
  return {
    question: stringOr(value.question, "No question returned."),
    choices: stringArray(value.choices).slice(0, 5),
    answer: stringOr(value.answer, "No answer returned."),
    explanation: stringOr(value.explanation, "No explanation returned.")
  };
}

function normalizeSimulation(value: { title?: unknown; scenario?: unknown; choices?: unknown; answer?: unknown; explanation?: unknown }) {
  return {
    title: stringOr(value.title, "Practice Scenario"),
    scenario: stringOr(value.scenario, "No scenario returned."),
    choices: stringArray(value.choices).slice(0, 5),
    answer: stringOr(value.answer, "No answer returned."),
    explanation: stringOr(value.explanation, "No explanation returned.")
  };
}

function normalizeStrategy(value: Partial<Omit<LearningStrategy, "id" | "videoId">>): Omit<LearningStrategy, "id" | "videoId"> {
  return {
    name: stringOr(value.name, "Learning Concept"),
    marketType: stringOr(value.marketType, "finance"),
    difficulty: difficultyOr(value.difficulty),
    setup: stringOr(value.setup, "No setup returned."),
    indicators: stringArray(value.indicators),
    entryRules: stringArray(value.entryRules),
    exitRules: stringArray(value.exitRules),
    stopLossRules: stringArray(value.stopLossRules),
    riskManagement: stringArray(value.riskManagement),
    example: stringOr(value.example, "No example returned."),
    mistakes: stringArray(value.mistakes),
    checklist: stringArray(value.checklist)
  };
}

function normalizeGlossaryTerm(value: Partial<LearningGlossaryTerm>) {
  return {
    term: stringOr(value.term, "Term"),
    definition: stringOr(value.definition, "No definition returned.")
  };
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 12) : [];
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function difficultyOr(value: unknown): "beginner" | "intermediate" | "advanced" {
  return value === "intermediate" || value === "advanced" ? value : "beginner";
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}
