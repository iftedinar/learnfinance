import { Card, PageHeader } from "@/components/ui";

const levels = [
  ["Beginner", "Risk/reward, stop losses, position sizing, glossary basics, five paper-trade simulations."],
  ["Intermediate", "VWAP context, support/resistance, trend following, mean reversion, journaling review."],
  ["Advanced", "Multi-timeframe planning, volatility sizing, strategy comparison, portfolio rules, post-trade analytics."]
] as const;

export default function RoadmapPage() {
  return (
    <>
      <PageHeader title="Learning Roadmap" description="A study plan generated from selected channels, saved strategies, and weak areas from simulations." />
      <div className="grid gap-4 md:grid-cols-3">
        {levels.map(([level, description]) => (
          <Card key={level}>
            <h2 className="text-xl font-semibold">{level}</h2>
            <p className="mt-3 text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
