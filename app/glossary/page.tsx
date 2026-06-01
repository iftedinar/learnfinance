import { Card, PageHeader } from "@/components/ui";
import { glossaryTerms } from "@/lib/mock-data";

export default function GlossaryPage() {
  return (
    <>
      <PageHeader title="Glossary" description="Auto-built finance and trading definitions connected back to source videos where possible." />
      <div className="grid gap-3 md:grid-cols-2">
        {glossaryTerms.map(([term, definition]) => (
          <Card key={term}>
            <h2 className="text-lg font-semibold">{term}</h2>
            <p className="mt-2 text-muted-foreground">{definition}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
