import Link from "next/link";

const navItems = [
  ["Dashboard", "/"],
  ["Channels", "/channels"],
  ["Resources", "/videos"],
  ["Strategies", "/strategies"],
  ["Simulations", "/simulations"],
  ["Roadmap", "/roadmap"],
  ["Glossary", "/glossary"],
  ["Notes", "/notes"],
  ["Settings", "/settings"]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              FL
            </span>
            <span>
              <span className="block text-base font-semibold">Finance Learning Agent</span>
              <span className="block text-sm text-muted-foreground">Education, summaries, strategies, simulations</span>
            </span>
          </Link>
          <nav className="flex gap-2 overflow-x-auto text-sm">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
