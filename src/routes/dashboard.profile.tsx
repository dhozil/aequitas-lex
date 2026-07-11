import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { connectWallet, disconnectWallet, loadAllCases, loadProfile, loadWallet, saveProfile, type Profile } from "@/lib/genlayer-service";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — Aequitas Lex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [p, setP] = useState<Profile>({ displayName: "", role: "", jurisdiction: "", bio: "" });
  const [wallet, setWallet] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setP(loadProfile());
    setWallet(loadWallet());
    loadAllCases().then((list) => setCount(list.length));
    const on = () => setWallet(loadWallet());
    window.addEventListener("aequitas:wallet-changed", on);
    return () => window.removeEventListener("aequitas:wallet-changed", on);
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(p);
    toast.success("Profile saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Profile</div>
        <h1 className="mt-2 font-serif text-4xl text-marble">Account & Identity</h1>
      </div>

      <div className="panel flex items-center gap-5 rounded-2xl p-6">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10">
          <User className="h-7 w-7 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-2xl text-marble">{p.displayName || "Anonymous Magistrate"}</div>
          <div className="text-sm text-muted-foreground">{p.role || "—"} · {p.jurisdiction || "—"}</div>
          <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{wallet ?? "No wallet connected"}</div>
        </div>
        <div className="text-right">
          <div className="font-serif text-3xl text-gold">{count}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">cases</div>
        </div>
      </div>

      <div className="panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">Wallet</div>
            <div className="mt-1 font-mono text-sm text-marble">{wallet ?? "Not connected"}</div>
          </div>
          {wallet ? (
            <Button variant="outline" onClick={() => disconnectWallet()} className="border-destructive/40 text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" /> Disconnect
            </Button>
          ) : (
            <Button onClick={() => connectWallet()} className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx">
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={save} className="panel space-y-5 rounded-2xl p-6">
        <h2 className="font-serif text-2xl text-marble">Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="dn" className="text-marble">Display name</Label>
            <Input id="dn" value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
          <div>
            <Label htmlFor="rl" className="text-marble">Role</Label>
            <Input id="rl" value={p.role} onChange={(e) => setP({ ...p, role: e.target.value })} placeholder="Investigator, Analyst, Counsel…" className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="ju" className="text-marble">Jurisdiction</Label>
            <Input id="ju" value={p.jurisdiction} onChange={(e) => setP({ ...p, jurisdiction: e.target.value })} className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="bi" className="text-marble">Bio</Label>
            <Textarea id="bi" rows={4} value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx">Save profile</Button>
        </div>
      </form>
    </div>
  );
}
