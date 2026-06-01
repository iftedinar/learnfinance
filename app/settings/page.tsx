import { Card, PageHeader } from "@/components/ui";

const envVars = ["OPENAI_API_KEY", "YOUTUBE_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL"];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Private MVP configuration checklist for API keys, database access, and deployment." />
      <Card>
        <h2 className="text-lg font-semibold">Environment Variables</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {envVars.map((envVar) => (
            <code key={envVar} className="rounded-md bg-muted px-3 py-2 text-sm">{envVar}</code>
          ))}
        </div>
      </Card>
    </>
  );
}
