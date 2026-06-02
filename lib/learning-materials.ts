export const learningStoreKey = "learn-finance-analysis-v1";

export type AnalysisStatus = "processed" | "metadata_only" | "transcript_missing" | "failed";

export type LearningVideo = {
  id: string;
  sourceType?: "youtube" | "article" | "notes";
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  channelTitle?: string;
  publishedAt?: string;
  transcriptStatus: AnalysisStatus;
  summary: string;
  keyConcepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  materials: {
    mainIdeas: string[];
    studyGuide: string[];
    actionItems: string[];
    warnings: string[];
    quizQuestions?: QuizQuestion[];
    simulationPrompts?: SimulationPrompt[];
  };
  sourceHealth: {
    hasTitle: boolean;
    hasPublishDate: boolean;
    hasTranscript: boolean;
    transcriptCharacterCount: number;
    missing: string[];
  };
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type SimulationPrompt = {
  title: string;
  scenario: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type LearningStrategy = {
  id: string;
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

export type LearningGlossaryTerm = {
  id: string;
  videoId: string;
  term: string;
  definition: string;
};

export type LearningAnalysis = {
  videos: LearningVideo[];
  strategies: LearningStrategy[];
  glossaryTerms: LearningGlossaryTerm[];
  updatedAt: string;
};

export const emptyLearningAnalysis: LearningAnalysis = {
  videos: [],
  strategies: [],
  glossaryTerms: [],
  updatedAt: ""
};

export type StoredLearningAnalysis = LearningAnalysis;

export const savedLearningStoreKey = "learn-finance-saved-v1";
