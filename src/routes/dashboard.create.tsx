import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitCase, CATEGORIES, type Category } from "@/lib/genlayer-service";
import { isContractConfigured } from "@/lib/genlayer-client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/create")({
  head: () => ({ meta: [{ title: "Create Case — Aequitas Lex" }] }),
  component: CreatePage,
});

function CreatePage() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Theft");
  const [damage, setDamage] = useState("1000");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5 - images.length);
    const next: string[] = [];
    for (const f of arr) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 2 * 1024 * 1024) { toast.error(`${f.name} exceeds 2MB`); continue; }
      const url = await new Promise<string>((res) => {
        const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(f);
      });
      next.push(url);
    }
    setImages((p) => [...p, ...next].slice(0, 5));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { toast.error("Title and description are required"); return; }
    setSubmitting(true);
    try {
      const result = await submitCase({
        title, description, category,
        estimatedDamage: Number(damage) || 0,
        location,
        images,
      });
      toast.success(isContractConfigured() ? "Case submitted on-chain" : "Case recorded locally");
      nav({ to: "/dashboard/cases" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit case");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Create Case</div>
        <h1 className="mt-2 font-serif text-4xl text-marble">Submit a new incident</h1>
        <p className="mt-2 text-sm text-muted-foreground">Details will be analyzed by three independent AI validators and recorded immutably.</p>
      </div>

      <form onSubmit={submit} className="panel space-y-6 rounded-2xl p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title" className="text-marble">Incident title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unauthorized warehouse entry on 12 March" className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="desc" className="text-marble">Description *</Label>
            <Textarea id="desc" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what happened, when, who was involved, and any evidence collected." className="mt-2 border-gold/20 bg-onyx/40" />
            <div className="mt-1 text-xs text-muted-foreground">More detail → higher confidence.</div>
          </div>
          <div>
            <Label htmlFor="cat" className="text-marble">Category</Label>
            <select id="cat" value={category} onChange={(e) => setCategory(e.target.value as Category)} className="mt-2 w-full rounded-md border border-gold/20 bg-onyx/40 px-3 py-2 text-sm text-marble focus:outline-none focus:ring-2 focus:ring-gold/40">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="dmg" className="text-marble">Estimated damage (USD)</Label>
            <Input id="dmg" type="number" min={0} value={damage} onChange={(e) => setDamage(e.target.value)} className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="loc" className="text-marble">Location <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, region, or address" className="mt-2 border-gold/20 bg-onyx/40" />
          </div>
        </div>

        <div>
          <Label className="text-marble">Evidence images <span className="text-muted-foreground">(optional, up to 5)</span></Label>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {images.map((src, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gold/20">
                <img src={src} alt={`Evidence ${i+1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-onyx/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="h-3 w-3 text-marble" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-gold/30 text-muted-foreground transition-colors hover:border-gold/60 hover:text-gold">
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                <div className="text-center">
                  <Upload className="mx-auto h-5 w-5" />
                  <div className="mt-1 text-xs">Upload</div>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <div className="text-xs text-muted-foreground">Submitting will invoke the Intelligent Contract and consume validator consensus.</div>
          <Button type="submit" disabled={submitting} className="bg-gradient-to-b from-[oklch(0.88_0.09_85)] to-[oklch(0.7_0.14_75)] text-onyx hover:opacity-95">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reasoning…</> : <><Sparkles className="mr-2 h-4 w-4" /> Submit for assessment</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
