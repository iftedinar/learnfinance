import { IngestionPanel } from "@/components/ingestion-panel";
import { Badge, Card, PageHeader } from "@/components/ui";
import { channels, strategies, videos } from "@/lib/mock-data";

export default function DashboardPage() {
  const processedVideos = videos.filter((video) => video.transcriptStatus === "processed").length;

  return (
    <>
      <PageHeader
        title="Learn finance from YouTube content"
        description="Collect one video, several videos, a playlist, or a whole channel; then turn transcripts into summaries, strategy notes, simulations, and searchable AI context."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Channels</p>
          <p className="mt-2 text-3xl font-semibold">{channels.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Processed videos</p>
          <p className="mt-2 text-3xl font-semibold">{processedVideos}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Strategies found</p>
          <p className="mt-2 text-3xl font-semibold">{strategies.length}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <IngestionPanel />
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Processing Queue</h2>
            <Badge tone="info">Private MVP</Badge>
          </div>
          <div className="mt-4 space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{video.title}</p>
                  <Badge tone={video.transcriptStatus === "processed" ? "success" : "warning"}>{video.transcriptStatus.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{video.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section className="mt-6 rounded-lg border border-warning/50 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
        This app is for education, organization, simulation, and strategy explanation only. It does not provide financial advice, buy or sell signals, or guaranteed outcomes.
      </section>
    </>
  );
}
