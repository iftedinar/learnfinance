import { Card, PageHeader } from "@/components/ui";

export default function ChannelsPage() {
  return (
    <>
      <PageHeader title="Channels" description="Channel imports will appear here after channel expansion is connected." />
      <Card>
        <h2 className="text-lg font-semibold">No channels imported yet</h2>
        <p className="mt-2 text-muted-foreground">
          The current working version analyzes one or two direct YouTube video URLs first. Channel processing will be added after video analysis is stable, with options like latest 50, first 50, playlist order, and most viewed.
        </p>
      </Card>
    </>
  );
}
