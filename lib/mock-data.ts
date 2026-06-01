import type { Channel, Note, Strategy, Video } from "@/lib/types";

export const channels: Channel[] = [
  {
    id: "channel-1",
    name: "Sample Market Education",
    url: "https://www.youtube.com/@samplemarketeducation",
    youtubeChannelId: "UC_SAMPLE_MARKET",
    status: "processed",
    videoCount: 18,
    strategyCount: 6,
    topics: ["risk management", "VWAP", "support and resistance", "position sizing"]
  },
  {
    id: "channel-2",
    name: "Long-Term Investing Lab",
    url: "https://www.youtube.com/@investinglab",
    youtubeChannelId: "UC_SAMPLE_INVEST",
    status: "processing",
    videoCount: 9,
    strategyCount: 3,
    topics: ["valuation", "portfolio allocation", "index funds"]
  }
];

export const videos: Video[] = [
  {
    id: "video-1",
    channelId: "channel-1",
    title: "VWAP Basics for Intraday Risk Control",
    youtubeUrl: "https://www.youtube.com/watch?v=sample-vwap",
    youtubeVideoId: "sample-vwap",
    publishedAt: "2026-05-12",
    transcriptStatus: "processed",
    summary:
      "Explains VWAP as an intraday reference line, when it can support trade context, and why it should be paired with volume and predefined risk.",
    keyConcepts: ["VWAP", "volume confirmation", "stop placement", "risk per trade"],
    difficulty: "beginner"
  },
  {
    id: "video-2",
    channelId: "channel-1",
    title: "Risk Reward Before Every Trade",
    youtubeUrl: "https://www.youtube.com/watch?v=sample-risk",
    youtubeVideoId: "sample-risk",
    publishedAt: "2026-05-18",
    transcriptStatus: "processed",
    summary:
      "Walks through position sizing, maximum loss, and how target distance changes whether a setup is worth practicing.",
    keyConcepts: ["risk/reward", "position sizing", "stop loss", "discipline"],
    difficulty: "beginner"
  },
  {
    id: "video-3",
    channelId: "channel-2",
    title: "Building a Durable Starter Portfolio",
    youtubeUrl: "https://www.youtube.com/watch?v=sample-portfolio",
    youtubeVideoId: "sample-portfolio",
    publishedAt: "2026-05-21",
    transcriptStatus: "processing",
    summary: "Queued for full summary generation after transcript chunking completes.",
    keyConcepts: ["allocation", "diversification", "time horizon"],
    difficulty: "beginner"
  }
];

export const strategies: Strategy[] = [
  {
    id: "strategy-1",
    channelId: "channel-1",
    videoId: "video-1",
    name: "VWAP Pullback Confirmation",
    marketType: "stocks",
    difficulty: "beginner",
    setup: "Price trends above VWAP, pulls back toward the line, and volume expands as buyers defend the area.",
    indicators: ["VWAP", "relative volume", "previous high/low"],
    entryRules: ["Wait for price to reclaim VWAP", "Confirm above-average volume", "Avoid entries directly into resistance"],
    exitRules: ["Take partial profits near prior high", "Exit if price closes back below VWAP with volume"],
    stopLossRules: ["Place stop below pullback low or below VWAP invalidation"],
    riskManagement: ["Risk 1% or less while learning", "Skip trades without at least 2:1 planned reward-to-risk"],
    example: "Entry at 50.00, stop at 49.50, target at 51.20 creates 0.50 risk for 1.20 potential reward.",
    mistakes: ["Chasing far above VWAP", "Ignoring low volume", "Moving the stop after entry"],
    checklist: ["Trend above VWAP", "Volume confirms", "Stop defined", "Reward-to-risk checked"]
  },
  {
    id: "strategy-2",
    channelId: "channel-1",
    videoId: "video-2",
    name: "Fixed Percent Position Sizing",
    marketType: "stocks, options, crypto, forex",
    difficulty: "beginner",
    setup: "Determine account risk first, then calculate position size from entry and stop distance.",
    indicators: ["entry price", "stop price", "account size"],
    entryRules: ["Calculate dollar risk before entry", "Only take setups where loss is acceptable"],
    exitRules: ["Follow the preplanned target or invalidation level"],
    stopLossRules: ["Stop is placed where the idea is invalid, not where the loss feels comfortable"],
    riskManagement: ["Use fixed fractional risk", "Reduce size when volatility widens stop distance"],
    example: "$1,000 account with 1% risk means max loss is $10. A $0.50 stop supports 20 shares.",
    mistakes: ["Sizing first and risk checking later", "Using the same share count for every setup"],
    checklist: ["Account risk set", "Stop distance known", "Position size calculated", "Trade logged"]
  }
];

export const notes: Note[] = [
  {
    id: "note-1",
    title: "Risk rules to repeat",
    body: "Before any simulation or paper trade, define account risk, stop location, and target. Do not practice setups with unclear invalidation.",
    sourceLabel: "Risk Reward Before Every Trade",
    updatedAt: "2026-06-01"
  }
];

export const glossaryTerms = [
  ["VWAP", "Volume-weighted average price; an intraday benchmark for average traded price weighted by volume."],
  ["Risk/reward", "The relationship between planned loss and planned gain for a trade idea."],
  ["Stop loss", "A predefined exit level for limiting loss when the setup is invalidated."],
  ["Position sizing", "The process of calculating how many units to trade based on account risk and stop distance."],
  ["Support", "A price area where buyers have previously shown interest."],
  ["Resistance", "A price area where sellers have previously shown interest."]
] as const;
