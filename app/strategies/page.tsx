import { Badge, Card, PageHeader } from "@/components/ui";
import { strategies, videos } from "@/lib/mock-data";

export default function StrategiesPage() {
  return (
    <>
      <PageHeader title="Strategy Library" description="Structured strategies extracted from transcript content with rules, risk controls, examples, mistakes, and checklists." />
      <div className="grid gap-4">
        {strategies.map((strategy) => {
          const sourceVideo = videos.find((video) => video.id === strategy.videoId);
          return (
            <Card key={strategy.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{strategy.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Source: {sourceVideo?.title ?? "Unknown video"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="info">{strategy.marketType}</Badge>
                    <Badge>{strategy.difficulty}</Badge>
                    {strategy.indicators.map((indicator) => <Badge key={indicator}>{indicator}</Badge>)}
                  </div>
                </div>
              </div>
              <p className="mt-4">{strategy.setup}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <RuleList title="Entry Rules" items={strategy.entryRules} />
                <RuleList title="Exit Rules" items={strategy.exitRules} />
                <RuleList title="Stop Loss" items={strategy.stopLossRules} />
                <RuleList title="Risk Management" items={strategy.riskManagement} />
              </div>
              <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                <strong>Example:</strong> {strategy.example}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function RuleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
