import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Scale, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectWallet, disconnectWallet, loadWallet } from "@/lib/genlayer-service";

export function SiteHeader() {
  const [wallet, setWallet] = useState<string | null>(null);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setWallet(loadWallet());
    const on = () => setWallet(loadWallet());
    window.addEventListener("aequitas:wallet-changed", on);
    return () => window.removeEventListener("aequitas:wallet-changed", on);
  }, []);

  const nav: { to: string; label: string; hash?: string }[] = [
    { to: "/", label: "Home" },
    { to: "/", label: "How It Works", hash: "how-it-works" },
    { to: "/", label: "Severity", hash: "severity" },
    { to: "/", label: "Consensus", hash: "consensus" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/docs", label: "Docs" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-onyx/60 shadow-[0_0_20px_-4px_var(--color-gold)]">
            <Scale className="h-5 w-5 text-gold" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg tracking-widest text-marble">AEQUITAS LEX</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Justice Through Intelligent Reasoning</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => {
            const key = n.label;
            const active = n.to === "/" ? pathname === "/" && (n.hash ? hash === n.hash : !hash) : (pathname === n.to || pathname.startsWith(n.to + "/"));
            return (
              <Link key={key} to={n.to} hash={n.hash} className={`relative text-sm transition-colors ${active ? "text-gold" : "text-muted-foreground hover:text-marble"}`}>
                {n.label}
                {active && <span className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-6 bg-gold" />}
              </Link>
            );
          })}
        </nav>
        <div>
          {wallet ? (
            <Button variant="outline" onClick={() => disconnectWallet()} className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold">
              <Wallet className="mr-2 h-4 w-4" />
              {wallet.slice(0, 6)}…{wallet.slice(-4)}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => connectWallet()} className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
