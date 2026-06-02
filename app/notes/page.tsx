"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { readSavedResources, removeSavedResource } from "@/lib/client-learning-store";
import type { LearningVideo } from "@/lib/learning-materials";

export default function NotesPage() {
  const [saved, setSaved] = useState<LearningVideo[]>([]);

  useEffect(() => {
    const refresh = () => setSaved(readSavedResources());
    refresh();
    window.addEventListener("learn-finance-saved-updated", refresh);
    return () => window.removeEventListener("learn-finance-saved-updated", refresh);
  }, []);

  return (
    <>
      <PageHeader title="Saved Notes" description="Only resources you choose to save appear here." />
      {saved.length === 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">Nothing saved yet</h2>
          <p className="mt-2 text-muted-foreground">Use the Save button on a resource when you want to keep it in Notes.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {saved.map((resource) => (
            <Card key={resource.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <Link href={`/resources/${encodeURIComponent(resource.id)}`} className="text-xl font-semibold text-accent">
                    {resource.title}
                  </Link>
                  <p className="mt-2 text-muted-foreground">{resource.summary}</p>
                </div>
                <button onClick={() => removeSavedResource(resource.id)} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
                  Unsave
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
