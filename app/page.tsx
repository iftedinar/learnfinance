import { IngestionPanel } from "@/components/ingestion-panel";
import { LearningDashboard } from "@/components/learning-dashboard";
import { PageHeader } from "@/components/ui";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Learn finance from YouTube content"
        description="Start with one or two direct YouTube video URLs. The app extracts summaries, key concepts, strategies, glossary terms, and study materials from transcripts when available."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <IngestionPanel />
        <LearningDashboard />
      </div>

      <section className="mt-6 rounded-lg border border-warning/50 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
        This app is for education, organization, simulation, and strategy explanation only. It does not provide financial advice, buy or sell signals, or guaranteed outcomes.
      </section>
    </>
  );
}
