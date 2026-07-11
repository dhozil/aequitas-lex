import type { Severity } from "@/lib/cases";

const styles: Record<Severity, string> = {
  Low: "bg-sev-low/15 text-sev-low border-sev-low/40",
  Medium: "bg-sev-medium/15 text-sev-medium border-sev-medium/40",
  High: "bg-sev-high/15 text-sev-high border-sev-high/40",
  Critical: "bg-sev-critical/15 text-sev-critical border-sev-critical/40",
};

export function SeverityBadge({ severity, className = "" }: { severity: Severity; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${styles[severity]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}
