export type Category = "Theft" | "Fraud" | "Assault" | "Cybercrime" | "Robbery" | "Vandalism" | "Other";
export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface ValidatorVerdict {
  name: string;
  severity: Severity;
  score: number;
  confidence: number;
  reasoning: string;
}

export interface AIAnalysis {
  summary: string;
  reasoning: string;
  keyFacts: string[];
  evidenceConsistency: number; // 0-100
  riskIndicators: string[];
  financialImpact: string;
  publicImpact: string;
  confidence: number; // 0-100
}

export interface CaseRecord {
  id: string;
  hash: string;
  title: string;
  description: string;
  category: Category;
  estimatedDamage: number;
  location?: string;
  images: string[]; // data URLs
  createdAt: number;
  analysis: AIAnalysis;
  validators: ValidatorVerdict[];
  consensus: {
    severity: Severity;
    score: number;
    confidence: number;
  };
  txHash: string;
  blockNumber: number;
}

const STORAGE_KEY = "aequitas_cases_v1";
const PROFILE_KEY = "aequitas_profile_v1";
const WALLET_KEY = "aequitas_wallet_v1";

export const CATEGORIES: Category[] = ["Theft", "Fraud", "Assault", "Cybercrime", "Robbery", "Vandalism", "Other"];

export function loadCases(): CaseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCases(list: CaseRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("aequitas:cases-changed"));
}

export function addCase(c: CaseRecord) {
  const list = loadCases();
  list.unshift(c);
  saveCases(list);
}

export function getCase(id: string): CaseRecord | undefined {
  return loadCases().find((c) => c.id === id);
}

export function deleteCase(id: string) {
  saveCases(loadCases().filter((c) => c.id !== id));
}

// --- Profile / Wallet ---
export interface Profile {
  displayName: string;
  role: string;
  jurisdiction: string;
  bio: string;
}
export function loadProfile(): Profile {
  if (typeof window === "undefined") return { displayName: "", role: "", jurisdiction: "", bio: "" };
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") || { displayName: "Anonymous Magistrate", role: "Investigator", jurisdiction: "Global", bio: "" }; }
  catch { return { displayName: "Anonymous Magistrate", role: "Investigator", jurisdiction: "Global", bio: "" }; }
}
export function saveProfile(p: Profile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }

export function loadWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_KEY);
}
export function connectWallet(): string {
  const addr = "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  localStorage.setItem(WALLET_KEY, addr);
  window.dispatchEvent(new CustomEvent("aequitas:wallet-changed"));
  return addr;
}
export function disconnectWallet() {
  localStorage.removeItem(WALLET_KEY);
  window.dispatchEvent(new CustomEvent("aequitas:wallet-changed"));
}

// --- Deterministic pseudo-AI reasoning ---
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seeded(seed: number) {
  let s = seed || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

const CATEGORY_WEIGHT: Record<Category, number> = {
  Theft: 40, Fraud: 55, Assault: 70, Cybercrime: 60, Robbery: 75, Vandalism: 30, Other: 45,
};

const RISK_POOL: Record<Category, string[]> = {
  Theft: ["Repeat offense pattern", "Unsecured property indicators", "Value beyond petty threshold"],
  Fraud: ["Falsified documentation suspected", "Cross-jurisdiction transfers", "Victim vulnerability factor"],
  Assault: ["Bodily harm reported", "Weapon involvement possible", "Multiple witnesses corroborate"],
  Cybercrime: ["Credential exfiltration signs", "Ransom communication detected", "Systemic infrastructure exposure"],
  Robbery: ["Use of force indicated", "Coordinated actors likely", "Public location risk multiplier"],
  Vandalism: ["Property defacement extensive", "Symbolic/hate motivation possible", "Public infrastructure impact"],
  Other: ["Ambiguous jurisdictional fit", "Requires manual review", "Insufficient precedent"],
};

function severityFromScore(score: number): Severity {
  if (score >= 82) return "Critical";
  if (score >= 62) return "High";
  if (score >= 38) return "Medium";
  return "Low";
}

export function runAnalysis(input: {
  title: string; description: string; category: Category; estimatedDamage: number; location?: string; imagesCount: number;
}): { analysis: AIAnalysis; validators: ValidatorVerdict[]; consensus: CaseRecord["consensus"] } {
  const rand = seeded(hashStr(input.title + "|" + input.description + "|" + input.category));

  const wordCount = input.description.trim().split(/\s+/).filter(Boolean).length;
  const detailScore = Math.min(30, wordCount / 3);
  const evidenceScore = Math.min(30, input.imagesCount * 6);
  const damageScore = Math.min(25, Math.log10(Math.max(1, input.estimatedDamage)) * 6);
  const catBase = CATEGORY_WEIGHT[input.category];

  const base = Math.min(100, catBase * 0.55 + detailScore + evidenceScore + damageScore);

  const summary = `A reported ${input.category.toLowerCase()} incident titled "${input.title}"${input.location ? ` occurring at ${input.location}` : ""}, with estimated damages of $${input.estimatedDamage.toLocaleString()}. ${wordCount < 15 ? "Narrative brevity limits certainty." : "Narrative provides sufficient context for structured reasoning."}`;

  const keyFacts = [
    `Category: ${input.category}`,
    `Estimated financial exposure: $${input.estimatedDamage.toLocaleString()}`,
    `Supporting evidence artifacts: ${input.imagesCount}`,
    input.location ? `Reported location: ${input.location}` : "Location undisclosed",
    `Description length: ${wordCount} words`,
  ];

  const risks = [...RISK_POOL[input.category]].sort(() => rand() - 0.5).slice(0, 2 + Math.floor(rand() * 2));

  const analysis: AIAnalysis = {
    summary,
    reasoning: summary,
    keyFacts,
    evidenceConsistency: Math.round(55 + evidenceScore + rand() * 10),
    riskIndicators: risks,
    financialImpact: input.estimatedDamage > 50000 ? "Significant" : input.estimatedDamage > 5000 ? "Moderate" : "Limited",
    publicImpact: catBase > 60 ? "High visibility, community concern likely" : catBase > 40 ? "Localized impact" : "Minor public footprint",
    confidence: Math.round(60 + Math.min(35, wordCount / 4) + rand() * 5),
  };

  const validatorNames = ["Validator Solon", "Validator Cicero", "Validator Ulpian"];
  const validators: ValidatorVerdict[] = validatorNames.map((name, i) => {
    const jitter = (rand() - 0.5) * 18;
    const score = Math.max(1, Math.min(100, Math.round(base + jitter)));
    const sev = severityFromScore(score);
    return {
      name,
      severity: sev,
      score,
      confidence: Math.round(70 + rand() * 25),
      reasoning: buildReasoning(input.category, sev, i, rand),
    };
  });

  const avg = Math.round(validators.reduce((a, v) => a + v.score, 0) / validators.length);
  const consensusSev = severityFromScore(avg);
  const consensusConf = Math.round(validators.reduce((a, v) => a + v.confidence, 0) / validators.length);

  return { analysis, validators, consensus: { severity: consensusSev, score: avg, confidence: consensusConf } };
}

function buildReasoning(cat: Category, sev: Severity, i: number, rand: () => number): string {
  const lens = ["procedural evidence weight", "harm magnitude and intent signals", "precedent alignment and jurisdictional norms"][i] || "structured factor analysis";
  const modifier = rand() > 0.5 ? "corroborated" : "partially supported";
  return `Assessment via ${lens}: the ${cat.toLowerCase()} report exhibits ${modifier} indicators consistent with a ${sev.toLowerCase()} severity classification.`;
}

export function makeHash(seed: string): string {
  const h = hashStr(seed + Date.now()).toString(16).padStart(8, "0");
  const h2 = hashStr(seed + "salt" + Math.random()).toString(16).padStart(8, "0");
  return "0x" + h + h2 + h.split("").reverse().join("") + h2.split("").reverse().join("");
}

export function severityToken(s: Severity): string {
  return {
    Low: "sev-low", Medium: "sev-medium", High: "sev-high", Critical: "sev-critical",
  }[s];
}
