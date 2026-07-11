import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Landmark, Brain, Lock, FileText, Users, ScaleIcon, ClipboardCheck, ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-scale.jpg";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { GoldParticles } from "@/components/gold-particles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aequitas Lex — AI-Powered Legal Case Assessment on GenLayer" },
      { name: "description", content: "Analyze evidence, assess case severity, and generate transparent AI recommendations using GenLayer Intelligent Contracts." },
      { property: "og:title", content: "Aequitas Lex — Justice Through Intelligent Reasoning" },
      { property: "og:description", content: "Analyze evidence, assess case severity, and generate transparent AI recommendations using GenLayer Intelligent Contracts." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <FeatureStrip />
      <HowItWorks />
      <SeverityLevels />
      <AIConsensus />
      <FAQ />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Golden scale of justice on a marble pedestal in a Roman courthouse" width={1920} height={1280} className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
      </div>
      <GoldParticles density={55} />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-onyx/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-gold">
            <Sparkles className="h-3 w-3" /> Built on GenLayer Intelligent Contracts
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-marble sm:text-6xl lg:text-7xl">
            AI-Powered<br />
            <span className="gold-gradient-text">Legal Case</span><br />
            Assessment
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Aequitas Lex uses AI and Intelligent Contracts on GenLayer to analyze cases, assess severity, and deliver transparent, explainable recommendations — recorded immutably on-chain.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] px-7 text-onyx shadow-[var(--shadow-gold)] hover:opacity-95">
              <Link to="/dashboard/create"><FileText className="mr-2 h-4 w-4" /> Create New Case</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold/40 px-7 text-marble hover:bg-gold/10 hover:text-gold">
              <Link to="/dashboard"><ClipboardCheck className="mr-2 h-4 w-4" /> View Dashboard</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-8 text-xs uppercase tracking-widest text-muted-foreground">
            <span>Transparent</span><span className="text-gold/40">•</span>
            <span>Decentralized</span><span className="text-gold/40">•</span>
            <span>Immutable</span>
          </div>
        </div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}

function FeatureStrip() {
  const items = [
    { icon: Shield, title: "Transparent", body: "Every analysis is explainable and verifiable." },
    { icon: Landmark, title: "Decentralized", body: "Built on GenLayer Intelligent Contracts." },
    { icon: Brain, title: "AI-Powered", body: "Multi-validator AI reasoning and consensus." },
    { icon: Lock, title: "Immutable", body: "Case data and results stored securely on-chain." },
  ];
  return (
    <section className="mx-auto -mt-16 max-w-7xl px-6 relative z-10">
      <div className="panel grid grid-cols-2 gap-6 rounded-2xl p-8 shadow-[var(--shadow-elegant)] md:grid-cols-4">
        {items.map((f) => (
          <div key={f.title} className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/5">
              <f.icon className="h-5 w-5 text-gold" />
            </div>
            <div>
              <div className="text-gold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, icon: FileText, title: "Submit Case", body: "Fill in case details and upload supporting evidence." },
    { n: 2, icon: Brain, title: "AI Analysis", body: "AI extracts facts, evidence consistency, and risk indicators." },
    { n: 3, icon: Users, title: "Validator Consensus", body: "Three independent AI validators review and vote." },
    { n: 4, icon: ScaleIcon, title: "Severity Assessment", body: "Receive a severity level, score, and explainable reasoning." },
    { n: 5, icon: ClipboardCheck, title: "On-Chain Record", body: "Results are recorded immutably on GenLayer." },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28">
      <div className="mb-14 max-w-2xl">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">How It Works</div>
        <h2 className="mt-3 font-serif text-4xl text-marble sm:text-5xl">From Evidence to Assessment</h2>
        <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold to-transparent" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <div key={s.n} className="group relative rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-gold)]">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-full border border-gold/40 text-sm text-gold">{s.n}</div>
            <s.icon className="mb-3 h-6 w-6 text-gold/70" />
            <h3 className="font-serif text-xl text-marble">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeverityLevels() {
  const levels = [
    { name: "Low", color: "sev-low", desc: "Minor impact, low harm", range: "0–37" },
    { name: "Medium", color: "sev-medium", desc: "Moderate impact, noticeable harm", range: "38–61" },
    { name: "High", color: "sev-high", desc: "Significant impact, serious harm", range: "62–81" },
    { name: "Critical", color: "sev-critical", desc: "Severe impact, extreme harm", range: "82–100" },
  ];
  return (
    <section id="severity" className="border-y border-border/40 bg-onyx/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Severity Levels</div>
            <h2 className="mt-3 font-serif text-4xl text-marble">Four calibrated tiers</h2>
            <p className="mt-4 text-muted-foreground">Every case is scored 0–100 and mapped to a severity tier with confidence bounds and explainable reasoning.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {levels.map((l) => (
              <div key={l.name} className={`rounded-xl border border-${l.color}/40 bg-${l.color}/5 p-6`}>
                <div className="flex items-center justify-between">
                  <div className={`text-lg uppercase tracking-widest text-${l.color}`}>{l.name}</div>
                  <div className="text-xs text-muted-foreground">Score {l.range}</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AIConsensus() {
  const validators = [
    { name: "Validator Solon", verdict: "High", score: 78 },
    { name: "Validator Cicero", verdict: "High", score: 74 },
    { name: "Validator Ulpian", verdict: "Medium", score: 61 },
  ];
  return (
    <section id="consensus" className="mx-auto max-w-7xl px-6 py-28">
      <div className="mb-14 max-w-2xl">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">AI Consensus</div>
        <h2 className="mt-3 font-serif text-4xl text-marble sm:text-5xl">Three validators. One verdict.</h2>
        <p className="mt-4 text-muted-foreground">Independent AI validators reason about the same case. Their votes are averaged into a transparent consensus, cryptographically recorded on-chain.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {validators.map((v) => (
          <div key={v.name} className="rounded-2xl border border-border/60 bg-card/60 p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{v.name}</div>
            <div className="mt-3 text-3xl font-serif text-gold">{v.score}</div>
            <div className="mt-1 text-sm text-marble">Verdict: {v.verdict}</div>
            <div className="mt-4 h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold-deep" style={{ width: `${v.score}%` }} />
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-6 shadow-[var(--shadow-gold)]">
          <div className="text-xs uppercase tracking-widest text-gold">Final Consensus</div>
          <div className="mt-3 font-serif text-4xl text-marble">High</div>
          <div className="mt-1 text-sm text-muted-foreground">Averaged score 71 · Confidence 88%</div>
          <Link to="/dashboard/create" className="mt-6 inline-flex items-center gap-1 text-sm text-gold hover:underline">
            Try it now <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Does Aequitas Lex determine guilt?", a: "No. Aequitas Lex is a demonstration platform that assesses reported case severity and provides explainable recommendations. It does not issue legal judgments." },
    { q: "What is GenLayer?", a: "GenLayer is a blockchain that supports Intelligent Contracts — smart contracts capable of running AI reasoning with multi-validator consensus, natively on-chain." },
    { q: "How is transparency ensured?", a: "Every assessment stores a timestamp, case hash, consensus result, and explainable validator reasoning that can be independently verified." },
    { q: "Is my evidence data private?", a: "This MVP stores case data locally in your browser. A production deployment would use encrypted off-chain storage with on-chain commitments." },
  ];
  return (
    <section id="faq" className="border-t border-border/40 bg-onyx/40">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">FAQ</div>
          <h2 className="mt-3 font-serif text-4xl text-marble">Frequently asked</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border/60 bg-card/60 p-5 open:border-gold/40">
              <summary className="cursor-pointer list-none font-serif text-xl text-marble flex items-center justify-between">
                {f.q}
                <ArrowRight className="h-4 w-4 text-gold transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 border-b border-border/40 pb-6 text-center text-sm italic text-muted-foreground">
          <span className="text-gold">❦</span> “Justitia non est absque ratione, sed cum ratione.” <span className="text-gold">❦</span>
          <div className="mt-1 text-xs">— Justice is not without reason, but with reason.</div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} Aequitas Lex — Built on GenLayer.</div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-gold">About</Link>
            <Link to="/docs" className="hover:text-gold">Docs</Link>
            <Link to="/dashboard" className="hover:text-gold">Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
