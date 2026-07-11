import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilePlus2, FolderOpen, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadAllCases, type CaseRecord, type Severity } from "@/lib/genlayer-service";
import { SeverityBadge } from "@/components/severity-badge";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadAllCases().then(setCases).finally(() => setLoading(false));
    const onChanged = () => loadAllCases().then(setCases);
    window.addEventListener("aequitas:cases-changed", onChanged);
    return () => window.removeEventListener("aequitas:cases-changed", onChanged);
  }, []);

  const total = cases.length;
  const bySev = cases.reduce<Record<Severity, number>>((a, c) => { a[c.consensus.severity]++; return a; }, { Low: 0, Medium: 0, High: 0, Critical: 0 });
  const avgScore = total ? Math.round(cases.reduce((a, c) => a + c.consensus.score, 0) / total) : 0;
  const avgConf = total ? Math.round(cases.reduce((a, c) => a + c.consensus.confidence, 0) / total) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Dashboard</div>
          <h1 className="mt-2 font-serif text-4xl text-marble">Chamber Overview</h1>
        </div>
        <Button asChild className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx hover:opacity-95">
          <Link to="/dashboard/create"><FilePlus2 className="mr-2 h-4 w-4" /> New case</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total cases" value={total} icon={FolderOpen} />
        <Stat label="Average score" value={avgScore} icon={TrendingUp} suffix="/100" />
        <Stat label="Avg confidence" value={avgConf} icon={Sparkles} suffix="%" />
        <Stat label="Critical" value={bySev.Critical} icon={TrendingUp} tone="critical" />
      </div>

      <div className="panel rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-marble">Severity distribution</h2>
          <span className="text-xs text-muted-foreground">{total} cases</span>
        </div>
        <div className="space-y-3">
          {(["Low", "Medium", "High", "Critical"] as Severity[]).map((s) => {
            const pct = total ? (bySev[s] / total) * 100 : 0;
            const color = { Low: "bg-sev-low", Medium: "bg-sev-medium", High: "bg-sev-high", Critical: "bg-sev-critical" }[s];
            return (
              <div key={s} className="grid grid-cols-[100px_1fr_50px] items-center gap-4">
                <SeverityBadge severity={s} />
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-right text-sm text-muted-foreground">{bySev[s]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-marble">Recent cases</h2>
          <Link to="/dashboard/cases" className="text-sm text-gold hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-gold" /> Loading…
          </div>
        ) : cases.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border/60">
            {cases.slice(0, 5).map((c) => (
              <Link key={c.id} to="/dashboard/cases/$id" params={{ id: c.id }} className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-accent/30 rounded-lg px-3 -mx-3">
                <div className="min-w-0">
                  <div className="truncate font-serif text-lg text-marble">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.category} · {new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gold">{c.consensus.score}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">score</div>
                  </div>
                  <SeverityBadge severity={c.consensus.severity} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, suffix, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; suffix?: string; tone?: "critical" }) {
  return (
    <div className="panel rounded-2xl p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">{label}</span>
        <Icon className={`h-4 w-4 ${tone === "critical" ? "text-sev-critical" : "text-gold"}`} />
      </div>
      <div className={`mt-3 font-serif text-4xl ${tone === "critical" ? "text-sev-critical" : "text-marble"}`}>
        {value}<span className="ml-1 text-lg text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-gold">
        <FilePlus2 className="h-5 w-5" />
      </div>
      <div className="font-serif text-xl text-marble">No cases yet</div>
      <p className="mt-1 text-sm text-muted-foreground">Submit your first case for AI-powered severity assessment.</p>
      <Button asChild className="mt-4 bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx hover:opacity-95">
        <Link to="/dashboard/create">Create case</Link>
      </Button>
    </div>
  );
}
