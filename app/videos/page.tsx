import { Badge, Card, PageHeader } from "@/components/ui";
import { videos } from "@/lib/mock-data";

export default function VideosPage() {
  return (
    <>
      <PageHeader title="Video Library" description="Review imported videos, transcript availability, summaries, concepts, difficulty, and source links." />
      <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        These rows are demo records. After Supabase processing is connected, this page should show videos from the exact video, playlist, or channel URLs the user imports.
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse bg-card text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Published</th>
              <th className="p-3">Transcript</th>
              <th className="p-3">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-t border-border align-top">
                <td className="p-3">
                  <a className="font-semibold text-accent" href={video.youtubeUrl}>{video.title}</a>
                  <p className="mt-2 text-muted-foreground">{video.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {video.keyConcepts.map((concept) => <Badge key={concept}>{concept}</Badge>)}
                  </div>
                </td>
                <td className="p-3">{video.publishedAt}</td>
                <td className="p-3"><Badge tone={video.transcriptStatus === "processed" ? "success" : "warning"}>{video.transcriptStatus.replace("_", " ")}</Badge></td>
                <td className="p-3">{video.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Search Saved Content</h2>
        <input className="mt-3 w-full rounded-md border border-border bg-background p-3 text-sm" placeholder="Search summaries, strategies, glossary terms, or notes" />
      </Card>
    </>
  );
}
