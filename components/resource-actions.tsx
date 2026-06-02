"use client";

import Link from "next/link";
import { downloadResourceDoc, downloadResourcePdf } from "@/lib/client-export";
import { readLearningAnalysis, removeLearningResource, saveResourceToNotes } from "@/lib/client-learning-store";
import type { LearningVideo } from "@/lib/learning-materials";

export function ResourceActions({ resource }: { resource: LearningVideo }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href={`/resources/${encodeURIComponent(resource.id)}`} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
        Open Study Guide
      </Link>
      <button onClick={() => saveResourceToNotes(resource)} className="rounded-md border border-border px-3 py-2 text-sm font-semibold">
        Save
      </button>
      <button onClick={() => downloadResourceDoc(resource, readLearningAnalysis())} className="rounded-md border border-border px-3 py-2 text-sm font-semibold">
        Word
      </button>
      <button onClick={() => downloadResourcePdf(resource, readLearningAnalysis())} className="rounded-md border border-border px-3 py-2 text-sm font-semibold">
        PDF
      </button>
      <button onClick={() => removeLearningResource(resource.id)} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
        Remove
      </button>
    </div>
  );
}
