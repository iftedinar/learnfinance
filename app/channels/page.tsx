import { Card, PageHeader } from "@/components/ui";

export default function ChannelsPage() {
  return (
    <>
      <PageHeader title="Sources" description="Source collections will appear here after persistent storage is connected." />
      <Card>
        <h2 className="text-lg font-semibold">No source collections yet</h2>
        <p className="mt-2 text-muted-foreground">
          The current version extracts knowledge from individual YouTube videos, article/webpage URLs, and pasted notes. Channel, playlist, and folder-style collections will be added after the extraction flow is stable.
        </p>
      </Card>
    </>
  );
}
