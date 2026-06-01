import { Card, PageHeader } from "@/components/ui";
import { notes } from "@/lib/mock-data";

export default function NotesPage() {
  return (
    <>
      <PageHeader
        title="Notes"
        description="Save learning notes, favorite videos, favorite strategies, questions, and progress."
        actions={
          <div className="flex gap-2">
            <a href="/api/export?format=doc" className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Word</a>
            <a href="/api/export?format=pdf" className="rounded-md border border-border px-4 py-2 text-sm font-semibold">PDF</a>
          </div>
        }
      />
      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{note.title}</h2>
                <p className="mt-2 text-muted-foreground">{note.body}</p>
              </div>
              <span className="text-sm text-muted-foreground">{note.updatedAt}</span>
            </div>
            <p className="mt-3 text-sm text-accent">Source: {note.sourceLabel}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
