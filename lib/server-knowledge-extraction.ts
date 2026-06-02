import OpenAI from "openai";
import { analyzeYoutubeVideos, extractYoutubeVideoId } from "@/lib/server-video-analysis";
import type { LearningAnalysis, LearningGlossaryTerm, LearningStrategy, LearningVideo } from "@/lib/learning-materials";

const maxContentCharacters = 90000;

type ExtractionInput = {
  urls: string[];
  notes?: string;
  files?: Array<{ name: string; text: string }>;
};

type ExtractedSource = {
  id: string;
  sourceType: "article" | "notes" | "file";
  title: string;
  url: string;
  text: string;
  missing: string[];
};

type ModelAnalysis = {
  summary: string;
  detailedSummary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  keyConcepts: string[];
  mainIdeas: string[];
  studyGuide: string[];
  actionItems: string[];
  formulas: string[];
  examples: string[];
  valuableLessons: string[];
  warnings: string[];
  quizQuestions: Array<{ question: string; choices: string[]; answer: string; explanation: string }>;
  simulationPrompts: Array<{ title: string; scenario: string; choices: string[]; answer: string; explanation: string }>;
  strategies: Array<Omit<LearningStrategy, "id" | "videoId">>;
  glossaryTerms: Array<{ term: string; definition: string }>;
};

export async function extractKnowledge(input: ExtractionInput): Promise<LearningAnalysis> {
  const urls = input.urls.map((url) => url.trim()).filter(Boolean);
  const youtubeUrls = urls.filter((url) => extractYoutubeVideoId(url));
  const otherUrls = urls.filter((url) => !extractYoutubeVideoId(url));

  const analyses: LearningAnalysis[] = [];
  if (youtubeUrls.length) {
    analyses.push(await analyzeYoutubeVideos(youtubeUrls));
  }

  const sources: ExtractedSource[] = [];
  for (const url of otherUrls.slice(0, 2)) {
    sources.push(await fetchWebSource(url));
  }

  if (input.notes?.trim()) {
    const text = input.notes.trim().slice(0, maxContentCharacters);
    sources.push({
      id: `notes-${hashText(text)}`,
      sourceType: "notes",
      title: "Pasted Notes",
      url: "pasted-notes",
      text,
      missing: []
    });
  }

  for (const file of input.files ?? []) {
    const text = file.text.trim().slice(0, maxContentCharacters);
    if (!text) {
      continue;
    }
    sources.push({
      id: `file-${hashText(file.name + text)}`,
      sourceType: "file",
      title: file.name,
      url: "uploaded-file",
      text,
      missing: []
    });
  }

  if (!analyses.length && !sources.length) {
    throw new Error("Paste a YouTube video URL, article/webpage URL, or notes to extract learning materials.");
  }

  for (const source of sources) {
    analyses.push(await analyzeTextSource(source));
  }

  return mergeAnalyses(analyses);
}

async function fetchWebSource(url: string): Promise<ExtractedSource> {
  const candidates = unique([url, stripTrackingParams(url)]);
  for (const candidate of candidates) {
    const source = await tryFetchWebSource(candidate, url);
    if (source && source.text.length > 500) {
      return source;
    }
  }

  return {
    id: `article-${hashText(url)}`,
    sourceType: "article",
    title: url,
    url,
    text: url,
    missing: ["readable article text"]
  };
}

async function tryFetchWebSource(url: string, originalUrl: string): Promise<ExtractedSource | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "LearnFinanceKnowledgeExtractor/0.1"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const title = extractTitle(html) ?? url;
    const text = htmlToText(html).slice(0, maxContentCharacters);
    return {
      id: `article-${hashText(originalUrl)}`,
      sourceType: "article",
      title,
      url: originalUrl,
      text,
      missing: text ? [] : ["readable article text"]
    };
  } catch {
    return undefined;
  }
}

async function analyzeTextSource(source: ExtractedSource): Promise<LearningAnalysis> {
  const modelAnalysis = await analyzeWithOpenAI(source);
  const video: LearningVideo = {
    id: source.id,
    sourceType: source.sourceType,
    title: source.title,
    youtubeUrl: source.url,
    youtubeVideoId: source.id,
    transcriptStatus: source.text && source.missing.length === 0 ? "processed" : "metadata_only",
    summary: modelAnalysis.summary,
    keyConcepts: modelAnalysis.keyConcepts,
    difficulty: modelAnalysis.difficulty,
    materials: {
      detailedSummary: modelAnalysis.detailedSummary,
      mainIdeas: modelAnalysis.mainIdeas,
      studyGuide: modelAnalysis.studyGuide,
      actionItems: modelAnalysis.actionItems,
      formulas: modelAnalysis.formulas,
      examples: modelAnalysis.examples,
      valuableLessons: modelAnalysis.valuableLessons,
      warnings: modelAnalysis.warnings,
      quizQuestions: modelAnalysis.quizQuestions,
      simulationPrompts: modelAnalysis.simulationPrompts
    },
    sourceHealth: {
      hasTitle: Boolean(source.title),
      hasPublishDate: false,
      hasTranscript: Boolean(source.text),
      transcriptCharacterCount: source.text.length,
      missing: source.missing
    }
  };

  return {
    videos: [video],
    strategies: modelAnalysis.strategies.map((strategy, index) => ({
      ...strategy,
      id: `${source.id}-strategy-${index + 1}`,
      videoId: source.id
    })),
    glossaryTerms: modelAnalysis.glossaryTerms.map((term, index) => ({
      id: `${source.id}-term-${index + 1}`,
      videoId: source.id,
      term: term.term,
      definition: term.definition
    })),
    updatedAt: new Date().toISOString()
  };
}

async function analyzeWithOpenAI(source: ExtractedSource): Promise<ModelAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalysis(source, "OPENAI_API_KEY is missing.");
  }

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
            "You extract deep finance learning materials from user-provided source text. Return only valid JSON. Prioritize detail, mechanisms, formulas, assumptions, examples, limitations, evidence, methods, results, and practice. Write for a learner who wants to master the material, not skim it. Do not give financial advice, buy/sell instructions, or guaranteed outcomes."
        },
        {
          role: "user",
          content: `Extract structured learning materials from this finance resource.

Source title: ${source.title}
Source type: ${source.sourceType}
Missing source data: ${source.missing.length ? source.missing.join(", ") : "none"}

Content:
${source.text}

Return detailed JSON with:
{
  "summary": "short executive summary, 3-5 sentences",
  "detailedSummary": "long detailed study summary of at least 900 words when source text supports it. Cover the thesis, background, methods, mechanisms, assumptions, evidence, results, limitations, implications, and why a finance learner should care.",
  "difficulty": "beginner",
  "keyConcepts": ["concept with short explanation"],
  "mainIdeas": ["detailed main idea with why it matters"],
  "studyGuide": ["specific item the learner should understand deeply, with details"],
  "actionItems": ["practice task or problem to solve"],
  "formulas": ["formula/model/rule and explanation, if any"],
  "examples": ["concrete example from or inspired by the material"],
  "valuableLessons": ["valuable lesson or takeaway for finance learning"],
  "warnings": ["risk or accuracy warning"],
  "quizQuestions": [{"question": "challenging question", "choices": ["A", "B", "C", "D"], "answer": "A", "explanation": "why this is correct and why alternatives are weaker"}],
  "simulationPrompts": [{"title": "scenario title", "scenario": "realistic finance learning scenario", "choices": ["choice"], "answer": "best answer", "explanation": "feedback and reasoning"}],
  "strategies": [{
    "name": "strategy/framework/concept",
    "marketType": "stocks/options/crypto/forex/investing/personal finance/etc",
    "difficulty": "beginner",
    "setup": "description",
    "indicators": ["tool or concept"],
    "entryRules": ["educational rule"],
    "exitRules": ["educational rule"],
    "stopLossRules": ["risk control or invalidation rule"],
    "riskManagement": ["risk rule"],
    "example": "hypothetical example",
    "mistakes": ["mistake"],
    "checklist": ["checklist item"]
  }],
  "glossaryTerms": [{"term": "term", "definition": "definition"}]
}`
        }
      ]
    });
    raw = response.choices[0]?.message.content;
  } catch (caught) {
    return fallbackAnalysis(source, caught instanceof Error ? caught.message : "OpenAI request failed.");
  }

  if (!raw) {
    return fallbackAnalysis(source, "OpenAI returned no content.");
  }

  try {
    return normalizeModelAnalysis(JSON.parse(raw));
  } catch {
    return fallbackAnalysis(source, "OpenAI returned invalid JSON.");
  }
}

function fallbackAnalysis(source: ExtractedSource, reason: string): ModelAnalysis {
  return {
    summary: `Could not run full AI extraction for "${source.title}". ${reason}`,
    detailedSummary: `Source text was captured, but detailed AI extraction could not run. ${reason}`,
    difficulty: "beginner",
    keyConcepts: [],
    mainIdeas: source.text ? ["Source text was captured, but structured AI extraction did not complete."] : [],
    studyGuide: ["Confirm OPENAI_API_KEY is set in Vercel and try again."],
    actionItems: ["Try pasting source text directly if the article or transcript cannot be fetched."],
    formulas: [],
    examples: [],
    valuableLessons: [],
    warnings: ["Do not treat this fallback as a full summary."],
    quizQuestions: [],
    simulationPrompts: [],
    strategies: [],
    glossaryTerms: []
  };
}

function mergeAnalyses(analyses: LearningAnalysis[]): LearningAnalysis {
  return {
    videos: analyses.flatMap((analysis) => analysis.videos),
    strategies: analyses.flatMap((analysis) => analysis.strategies),
    glossaryTerms: analyses.flatMap((analysis) => analysis.glossaryTerms),
    updatedAt: new Date().toISOString()
  };
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeModelAnalysis(value: Partial<ModelAnalysis>): ModelAnalysis {
  return {
    summary: stringOr(value.summary, "No summary returned."),
    detailedSummary: stringOr(value.detailedSummary, stringOr(value.summary, "No detailed summary returned.")),
    difficulty: difficultyOr(value.difficulty),
    keyConcepts: stringArray(value.keyConcepts, 30),
    mainIdeas: stringArray(value.mainIdeas, 25),
    studyGuide: stringArray(value.studyGuide, 30),
    actionItems: stringArray(value.actionItems, 20),
    formulas: stringArray(value.formulas, 20),
    examples: stringArray(value.examples, 20),
    valuableLessons: stringArray(value.valuableLessons, 25),
    warnings: stringArray(value.warnings, 15),
    quizQuestions: Array.isArray(value.quizQuestions) ? value.quizQuestions.map(normalizeQuiz).slice(0, 15) : [],
    simulationPrompts: Array.isArray(value.simulationPrompts) ? value.simulationPrompts.map(normalizeSimulation).slice(0, 12) : [],
    strategies: Array.isArray(value.strategies) ? value.strategies.map(normalizeStrategy).slice(0, 15) : [],
    glossaryTerms: Array.isArray(value.glossaryTerms) ? value.glossaryTerms.map(normalizeGlossaryTerm).slice(0, 40) : []
  };
}

function normalizeQuiz(value: { question?: unknown; choices?: unknown; answer?: unknown; explanation?: unknown }) {
  return {
    question: stringOr(value.question, "No question returned."),
    choices: stringArray(value.choices, 5).slice(0, 5),
    answer: stringOr(value.answer, "No answer returned."),
    explanation: stringOr(value.explanation, "No explanation returned.")
  };
}

function normalizeSimulation(value: { title?: unknown; scenario?: unknown; choices?: unknown; answer?: unknown; explanation?: unknown }) {
  return {
    title: stringOr(value.title, "Practice Scenario"),
    scenario: stringOr(value.scenario, "No scenario returned."),
    choices: stringArray(value.choices, 5).slice(0, 5),
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
    indicators: stringArray(value.indicators, 12),
    entryRules: stringArray(value.entryRules, 15),
    exitRules: stringArray(value.exitRules, 15),
    stopLossRules: stringArray(value.stopLossRules, 15),
    riskManagement: stringArray(value.riskManagement, 15),
    example: stringOr(value.example, "No example returned."),
    mistakes: stringArray(value.mistakes, 15),
    checklist: stringArray(value.checklist, 20)
  };
}

function normalizeGlossaryTerm(value: Partial<LearningGlossaryTerm>) {
  return {
    term: stringOr(value.term, "Term"),
    definition: stringOr(value.definition, "No definition returned.")
  };
}

function stringArray(value: unknown, limit = 12) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, limit) : [];
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function difficultyOr(value: unknown): "beginner" | "intermediate" | "advanced" {
  return value === "intermediate" || value === "advanced" ? value : "beginner";
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function stripTrackingParams(value: string) {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gclid|fbclid|gad_|gbraid|wbraid|mc_)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return value;
  }
}

function unique(values: string[]) {
  return [...new Set(values)];
}
