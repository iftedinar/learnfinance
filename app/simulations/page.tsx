import { Card, PageHeader } from "@/components/ui";

const simulations = [
  {
    title: "Risk 1% on a $1,000 Account",
    scenario: "You are practicing with a $1,000 account and want to risk 1% on one trade. What is the maximum planned loss?",
    choices: ["$10", "$25", "$100"],
    answer: "$10",
    explanation: "1% of $1,000 is $10. Position size should be calculated from this max loss and the stop distance."
  },
  {
    title: "VWAP Break With High Volume",
    scenario: "Price reclaims VWAP, volume expands, and resistance is nearby. What should a disciplined trader check before entry?",
    choices: ["Reward-to-risk and stop location", "Only the green candle", "Social media sentiment"],
    answer: "Reward-to-risk and stop location",
    explanation: "A setup is incomplete until invalidation, position size, and target distance are defined."
  }
];

export default function SimulationsPage() {
  return (
    <>
      <PageHeader title="Simulations" description="Practice finance and trading concepts with structured scenarios before risking real money." />
      <div className="grid gap-4 md:grid-cols-2">
        {simulations.map((simulation) => (
          <Card key={simulation.title}>
            <h2 className="text-xl font-semibold">{simulation.title}</h2>
            <p className="mt-3 text-muted-foreground">{simulation.scenario}</p>
            <div className="mt-4 grid gap-2">
              {simulation.choices.map((choice) => (
                <button key={choice} className="rounded-md border border-border px-3 py-2 text-left text-sm hover:border-primary">
                  {choice}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-muted p-3 text-sm">
              <strong>Answer:</strong> {simulation.answer}. {simulation.explanation}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
