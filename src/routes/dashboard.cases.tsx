import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, FilePlus2, Loader2, X, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAllCases, loadCaseById, deleteCase, CATEGORIES, type CaseRecord, type Severity, type Category } from "@/lib/genlayer-service";
import { SeverityBadge } from "@/components/severity-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/cases")({
  head: () => ({ meta: [{ title: "My Cases — Aequitas Lex" }] }),
  component: CasesPage,
});

function CasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<Severity | "All">("All");
  const [cat, setCat] = useState<Category | "All">("All");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseRecord | null | undefined>(undefined);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadAllCases().then(setCases).finally(() => setLoading(false));
    const onChanged = () => loadAllCases().then(setCases);
    window.addEventListener("aequitas:cases-changed", onChanged);
    return () => window.removeEventListener("aequitas:cases-changed", onChanged);
  }, []);

  useEffect(() => {
    if (!detailId) { setDetail(undefined); return; }
    setDetailLoading(true);
    loadCaseById(detailId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [detailId]);

  const filtered = useMemo(() => cases.filter((c) =>
    (sev === "All" || c.consensus.severity === sev) &&
    (cat === "All" || c.category === cat) &&
    (q === "" || c.title.toLowerCase().includes(q.toLowerCase()) || c.description.toLowerCase().includes(q.toLowerCase()) || c.hash.includes(q))
  ), [cases, q, sev, cat]);

  const remove = (id: string) => {
    deleteCase(id);
    if (detailId === id) setDetailId(null);
    toast.success("Case removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold">My Cases</div>
          <h1 className="mt-2 font-serif text-4xl text-marble">Case ledger</h1>
        </div>
        <Button asChild className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx hover:opacity-95">
          <Link to="/dashboard/create"><FilePlus2 className="mr-2 h-4 w-4" /> New case</Link>
        </Button>
      </div>

      <div className="panel flex flex-wrap gap-3 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, description or hash" className="border-gold/20 bg-onyx/40 pl-9" />
        </div>
        <select value={sev} onChange={(e) => setSev(e.target.value as Severity | "All")} className="rounded-md border border-gold/20 bg-onyx/40 px-3 py-2 text-sm">
          <option>All</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value as Category | "All")} className="rounded-md border border-gold/20 bg-onyx/40 px-3 py-2 text-sm">
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="panel flex items-center justify-center gap-3 rounded-2xl p-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold" /> Loading cases…
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel rounded-2xl p-12 text-center text-muted-foreground">
          {cases.length === 0 ? "No cases yet. Create your first case." : "No cases match your filters."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <div key={c.id} onClick={() => setDetailId(c.id)} className="panel group relative cursor-pointer overflow-hidden rounded-2xl p-5 transition-all hover:border-gold/40 hover:shadow-[var(--shadow-gold)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.category}</div>
                  <div className="mt-1 truncate font-serif text-xl text-marble">{c.title}</div>
                </div>
                <SeverityBadge severity={c.consensus.severity} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Score <span className="text-gold">{c.consensus.score}</span> &middot; Conf {c.consensus.confidence}%</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="truncate font-mono text-[10px] text-muted-foreground/70">{c.hash}</span>
                <span className="shrink-0 text-xs font-semibold text-gold group-hover:text-gold-soft transition-colors">View details &rarr;</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail overlay */}
      {detailId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12 backdrop-blur-sm" onClick={() => setDetailId(null)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="panel flex items-center justify-center gap-3 rounded-2xl p-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-gold" /> Loading case…
              </div>
            ) : !detail ? (
              <div className="panel rounded-2xl p-10 text-center">
                <div className="font-serif text-2xl text-marble">Case not found</div>
                <p className="mt-2 text-sm text-muted-foreground">This case may have been deleted.</p>
                <Button className="mt-4" onClick={() => setDetailId(null)}>Back to cases</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setDetailId(null)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold">
                  <ArrowLeft className="h-3 w-3" /> All cases
                </button>

                <div className="panel rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{detail.category} &middot; {new Date(detail.createdAt).toLocaleString()}</div>
                      <h1 className="mt-2 font-serif text-3xl text-marble">{detail.title}</h1>
                      {detail.location && <div className="mt-1 text-sm text-muted-foreground">{detail.location}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={detail.consensus.severity} className="text-sm px-3 py-1" />
                      <Button variant="outline" size="sm" onClick={() => { deleteCase(detail.id); setDetailId(null); toast.success("Case removed"); }} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gold">Description</div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-marble/90">{detail.description}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-5 shadow-[var(--shadow-gold)]">
                        <div className="text-xs uppercase tracking-widest text-gold">Consensus verdict</div>
                        <div className="mt-2 flex items-baseline gap-3">
                          <div className="font-serif text-5xl text-marble">{detail.consensus.score}</div>
                          <div className="text-sm text-muted-foreground">/ 100</div>
                        </div>
                        <div className="mt-2"><SeverityBadge severity={detail.consensus.severity} /></div>
                        <div className="mt-3 text-xs text-muted-foreground">Confidence {detail.consensus.confidence}%</div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-onyx/60">
                          <div className="h-full bg-gradient-to-r from-gold-soft to-gold-deep" style={{ width: `${detail.consensus.score}%` }} />
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-onyx/40 p-5">
                        <div className="text-xs uppercase tracking-widest text-gold">On-chain record</div>
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Case hash</span>
                            <span className="font-mono text-marble">{detail.hash}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Tx hash</span>
                            <span className="font-mono text-marble">{detail.txHash}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Block</span>
                            <span className="font-mono text-marble">#{detail.blockNumber.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Timestamp</span>
                            <span className="font-mono text-marble">{new Date(detail.createdAt).toISOString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel rounded-2xl p-6">
                  <h2 className="font-serif text-2xl text-marble">AI Analysis</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{detail.analysis.summary}</p>
                  {detail.analysis.reasoning && (
                    <div className="mt-3 rounded-lg border border-gold/10 bg-onyx/30 p-3">
                      <div className="text-xs uppercase tracking-widest text-gold">Reasoning</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail.analysis.reasoning}</p>
                    </div>
                  )}
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gold">Key facts</div>
                      <ul className="mt-2 space-y-1.5 text-sm text-marble/90">
                        {detail.analysis.keyFacts.map((k, i) => (
                          <li key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {k}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gold">Risk indicators</div>
                      <ul className="mt-2 space-y-1.5 text-sm text-marble/90">
                        {detail.analysis.riskIndicators.map((r, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sev-high" /> {r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="uppercase tracking-widest text-gold">Evidence consistency</span>
                        <span className="text-marble">{detail.analysis.evidenceConsistency}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gradient-to-r from-gold-soft to-gold-deep" style={{ width: `${detail.analysis.evidenceConsistency}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="uppercase tracking-widest text-gold">Model confidence</span>
                        <span className="text-marble">{detail.analysis.confidence}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gradient-to-r from-gold-soft to-gold-deep" style={{ width: `${detail.analysis.confidence}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gold">Financial impact</div>
                      <div className="mt-1 text-sm text-marble">{detail.analysis.financialImpact}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gold">Public impact</div>
                      <div className="mt-1 text-sm text-marble">{detail.analysis.publicImpact}</div>
                    </div>
                  </div>
                </div>

                <div className="panel rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-marble">Validator Consensus</h2>
                    <span className="text-xs text-muted-foreground">3 independent AI validators</span>
                  </div>
                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {detail.validators.map((v) => (
                      <div key={v.name} className="rounded-xl border border-border/60 bg-onyx/40 p-5">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-marble">{v.name}</div>
                          <SeverityBadge severity={v.severity} />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <div className="font-serif text-3xl text-gold">{v.score}</div>
                          <div className="text-xs text-muted-foreground">score &middot; {v.confidence}% conf</div>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-gradient-to-r from-gold-soft to-gold-deep" style={{ width: `${v.score}%` }} />
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{v.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
