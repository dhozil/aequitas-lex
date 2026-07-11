import { createFileRoute, Link } from "@tanstack/react-router";
import { Book, FileText, Brain, Users, ScaleIcon, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Aequitas Lex" },
      { name: "description", content: "Documentation for Aequitas Lex — architecture, workflow, and severity model." },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  const toc = [
    { id: "overview", label: "Overview", icon: Book },
    { id: "workflow", label: "Workflow", icon: FileText },
    { id: "reasoning", label: "AI Reasoning", icon: Brain },
    { id: "validators", label: "Validators", icon: Users },
    { id: "severity", label: "Severity model", icon: ScaleIcon },
    { id: "transparency", label: "Transparency", icon: Lock },
  ];
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Documentation</div>
          <nav className="mt-4 space-y-1">
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-gold">
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </a>
            ))}
          </nav>
        </aside>
        <article className="prose prose-invert max-w-none space-y-12">
          <header>
            <h1 className="font-serif text-5xl text-marble">Aequitas Lex Documentation</h1>
            <p className="mt-3 text-muted-foreground">A concise reference for the assessment pipeline, severity model, and on-chain transparency guarantees.</p>
          </header>

          <Section id="overview" title="Overview">
            Aequitas Lex is an AI-powered legal case assessment platform built on GenLayer Intelligent Contracts. It ingests case submissions, produces structured AI analyses, and reaches a multi-validator consensus on severity — all with explainable reasoning committed to the chain.
            <br /><br />
            <strong className="text-gold">Aequitas Lex does not determine guilt or issue legal judgments.</strong> It offers explainable severity recommendations for investigators, analysts, and administrative bodies.
          </Section>

          <Section id="workflow" title="Workflow">
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-marble/90">
              <li>Submit a case with title, description, category, estimated damage, optional location, and up to five evidence images.</li>
              <li>An Intelligent Contract dispatches the payload to three independent AI validators.</li>
              <li>Each validator returns a severity score, a confidence value, and short reasoning.</li>
              <li>The contract computes a consensus score and severity tier.</li>
              <li>The record — case hash, transaction hash, timestamp, verdicts — is stored immutably.</li>
            </ol>
          </Section>

          <Section id="reasoning" title="AI Reasoning">
            Each analysis extracts a summary, key facts, evidence consistency, risk indicators, financial impact, and public impact. Confidence scales with the richness of the submission — narrative depth and evidence artifacts materially improve accuracy.
          </Section>

          <Section id="validators" title="Validators">
            Three validators — <em>Solon</em>, <em>Cicero</em>, and <em>Ulpian</em> — reason from distinct lenses: procedural evidence weight, harm magnitude and intent, and precedent alignment. Their independent votes are averaged into the consensus.
          </Section>

          <Section id="severity" title="Severity Model">
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["Low", "0–37", "Minor impact, low harm"],
                ["Medium", "38–61", "Moderate impact, noticeable harm"],
                ["High", "62–81", "Significant impact, serious harm"],
                ["Critical", "82–100", "Severe impact, extreme harm"],
              ].map(([n, r, d]) => (
                <div key={n} className="rounded-lg border border-border/60 bg-onyx/40 p-4">
                  <div className="text-gold">{n} <span className="ml-1 text-xs text-muted-foreground">Score {r}</span></div>
                  <div className="mt-1 text-sm text-muted-foreground">{d}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="transparency" title="Transparency">
            Every assessment stores a timestamp, case hash, tx hash, block number, consensus score & tier, and per-validator reasoning. Records cannot be silently modified after commitment.
          </Section>

          <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-6 text-center shadow-[var(--shadow-gold)]">
            <h3 className="font-serif text-2xl text-marble">Ready to try it?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Submit a demonstration case and inspect the full reasoning trail.</p>
            <Link to="/dashboard/create" className="mt-4 inline-flex items-center justify-center rounded-md bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] px-5 py-2 text-sm text-onyx">Create a case</Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-serif text-3xl text-marble">{title}</h2>
      <div className="mt-3 text-marble/90 leading-relaxed">{children}</div>
    </section>
  );
}
