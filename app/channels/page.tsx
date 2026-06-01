import { Badge, Card, PageHeader } from "@/components/ui";
import { channels } from "@/lib/mock-data";

export default function ChannelsPage() {
  return (
    <>
      <PageHeader title="Channels" description="Track channel-level ingestion, transcript coverage, topics, and strategy counts." />
      <div className="grid gap-4">
        {channels.map((channel) => (
          <Card key={channel.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{channel.name}</h2>
                <a className="mt-1 block text-sm text-accent" href={channel.url}>{channel.url}</a>
                <div className="mt-3 flex flex-wrap gap-2">
                  {channel.topics.map((topic) => <Badge key={topic}>{topic}</Badge>)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <Metric label="Videos" value={channel.videoCount} />
                <Metric label="Strategies" value={channel.strategyCount} />
                <Metric label="Status" value={channel.status.replace("_", " ")} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="font-semibold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
