"use client";

import { Card, PageHeader } from "@/components/ui";
import { clearLearningAnalysis } from "@/lib/client-learning-store";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Account, data, and learning workspace controls." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-2 text-muted-foreground">Authentication is not connected yet. When Supabase Auth is added, this area will handle sign up, login, sign out, and profile settings.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled className="rounded-md border border-border px-3 py-2 text-sm font-semibold opacity-60">Create Account</button>
            <button disabled className="rounded-md border border-border px-3 py-2 text-sm font-semibold opacity-60">Sign In</button>
            <button disabled className="rounded-md border border-border px-3 py-2 text-sm font-semibold opacity-60">Sign Out</button>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Workspace Data</h2>
          <p className="mt-2 text-muted-foreground">Current MVP data is stored in this browser. Use reset when you want to clear processed resources and start fresh.</p>
          <button onClick={clearLearningAnalysis} className="mt-4 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
            Reset Processed Resources
          </button>
        </Card>
      </div>
    </>
  );
}
