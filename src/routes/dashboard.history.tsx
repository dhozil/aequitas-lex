import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadAllCases, type CaseRecord, type Severity } from "@/lib/genlayer-service";
import { SeverityBadge } from "@/components/severity-badge";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "Severity History — Aequitas Lex" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadAllCases().then(setCases).finally(() => setLoading(false));
    const onChanged = () => loadAllCases().then(setCases);
    window.addEventListener("aequitas:cases-changed", onChanged);
    return () => window.removeEventListener("aequitas:cases-changed", onChanged);
  }, []);

  const sorted = [...cases].sort((a, b) => a.createdAt - b.createdAt);
  const max = 100;
  const w = 900, h = 260, pad = 32;
  const pts = sorted.map((c, i) => {
    const x = pad + (i / Math.max(1, sorted.length - 1)) * (w - pad * 2);
    const y = h - pad - (c.consensus.score / max) * (h - pad * 2);
    return { x, y, c };
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ");
  const sevColor: Record<Severity, string> = { Low: "var(--sev-low)", Medium: "var(--sev-medium)", High: "var(--sev-high)", Critical: "var(--sev-critical)" };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Severity History</div>
        <h1 className="mt-2 font-serif text-4xl text-marble">Timeline of assessments</h1>
      </div>

      <div className="panel rounded-2xl p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-gold" /> Loading…
          </div>
        ) : sorted.length < 2 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">
            Submit at least two cases to see the severity timeline.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[600px]">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((v) => {
                const y = h - pad - (v / max) * (h - pad * 2);
                return (
                  <g key={v}>
                    <line x1={pad} x2={w - pad} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" />
                    <text x={4} y={y + 3} fontSize="10" fill="currentColor" opacity="0.5">{v}</text>
                  </g>
                );
              })}
              <path d={`${path} L ${pts[pts.length - 1].x},${h - pad} L ${pts[0].x},${h - pad} Z`} fill="url(#area)" />
              <path d={path} fill="none" stroke="var(--color-gold)" strokeWidth="2" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill={sevColor[p.c.consensus.severity]} stroke="var(--background)" strokeWidth="2">
                  <title>{p.c.title} — {p.c.consensus.score}</title>
                </circle>
              ))}
            </svg>
          </div>
        )}
      </div>

      <div className="panel rounded-2xl p-6">
        <h2 className="mb-4 font-serif text-2xl text-marble">Case log</h2>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-gold" /> Loading…
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-sm text-muted-foreground">No cases yet.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {[...sorted].reverse().map((c) => (
              <Link key={c.id} to="/dashboard/cases/$id" params={{ id: c.id }} className="flex items-center justify-between gap-4 py-3 px-2 -mx-2 rounded-lg hover:bg-accent/30">
                <div className="min-w-0">
                  <div className="truncate text-marble">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()} · {c.category}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gold">{c.consensus.score}</span>
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
