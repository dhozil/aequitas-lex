import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, FilePlus2, Folder, History, User, ChevronLeft, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { loadWallet, connectWallet } from "@/lib/genlayer-service";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aequitas Lex" },
      { name: "description", content: "Create cases, review AI analysis, and inspect validator consensus." },
    ],
  }),
  component: DashboardLayout,
});

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/create", label: "Create Case", icon: FilePlus2 },
  { to: "/dashboard/cases", label: "My Cases", icon: Folder },
  { to: "/dashboard/history", label: "Severity History", icon: History },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

function WalletBanner() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setWallet(loadWallet());
    const on = () => setWallet(loadWallet());
    window.addEventListener("aequitas:wallet-changed", on);
    return () => window.removeEventListener("aequitas:wallet-changed", on);
  }, []);

  if (wallet || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gold/20 bg-gold/5 px-6 py-3">
      <div className="flex items-center gap-3 text-sm">
        <Wallet className="h-4 w-4 text-gold" />
        <span className="text-muted-foreground">Connect your wallet to submit cases and interact with the GenLayer contract.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={connecting}
          onClick={async () => {
            setConnecting(true);
            try {
              await connectWallet();
              toast.success("Wallet connected");
            } catch (e: any) {
              toast.error(e?.message || "Failed to connect wallet");
            } finally {
              setConnecting(false);
            }
          }}
          className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx"
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </Button>
        <button onClick={() => setDismissed(true)} className="text-xs text-muted-foreground hover:text-marble">&times;</button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <WalletBanner />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Link to="/" className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold">
            <ChevronLeft className="h-3 w-3" /> Back to home
          </Link>
          <nav className="panel rounded-xl p-2">
            {items.map((it) => {
              const p = pathname.replace(/\/+$/, "");
              const active = it.exact ? p === it.to : p === it.to || p.startsWith(it.to + "/");
              return (
                <Link key={it.to} to={it.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-gold/10 text-gold" : "text-muted-foreground hover:bg-accent hover:text-marble"}`}>
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-4 text-xs text-muted-foreground">
            <div className="mb-1 text-gold uppercase tracking-widest">Notice</div>
            Aequitas Lex does not determine guilt. It provides explainable severity assessments only.
          </div>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
