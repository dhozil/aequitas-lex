import { isContractConfigured } from "./genlayer-client";
import * as chain from "./genlayer-client";
import * as local from "./cases";
import type { CaseRecord, Category, Severity } from "./cases";

export type { CaseRecord, Category, Severity };

export { CATEGORIES } from "./cases";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

// === WRITE ===

export async function submitCase(params: {
  title: string;
  description: string;
  category: string;
  estimatedDamage: number;
  location?: string;
  images: string[];  // data URLs in frontend
}) {
  if (isContractConfigured()) {
    const imagesJson = JSON.stringify(params.images);
    const result = await chain.submitCaseWithLLM({
      title: params.title,
      description: params.description,
      category: params.category,
      estimatedDamage: params.estimatedDamage,
      location: params.location,
      images: imagesJson,
    });
    return result;
  }
  const dmg = params.estimatedDamage || 0;
  const { analysis, validators, consensus } = local.runAnalysis({
    title: params.title,
    description: params.description,
    category: params.category as Category,
    estimatedDamage: dmg,
    location: params.location,
    imagesCount: params.images.length,
  });
  const id = crypto.randomUUID();
  const rec: CaseRecord = {
    id,
    hash: local.makeHash(id + params.title),
    title: params.title,
    description: params.description,
    category: params.category as Category,
    estimatedDamage: dmg,
    location: params.location || undefined,
    images: params.images,
    createdAt: Date.now(),
    analysis, validators, consensus,
    txHash: local.makeHash("tx-" + id),
    blockNumber: 8_000_000 + Math.floor(Math.random() * 500_000),
  };
  local.addCase(rec);
  return {
    case_id: id,
    case_hash: rec.hash,
    tx_hash: rec.txHash,
    consensus: { severity: consensus.severity, score: consensus.score, confidence: consensus.confidence },
  } as const;
}

// === READ (with localStorage fallback) ===

export async function loadAllCases(): Promise<CaseRecord[]> {
  if (isContractConfigured()) {
    try {
      const records = await withTimeout(chain.getCasesPaginated(0, 100), 10000);
      return records.map((r) => ({
        id: (r as any).id || r.case_id,
        hash: r.tx_hash,
        title: r.title,
        description: r.description,
        category: r.category as Category,
        estimatedDamage: r.estimated_damage,
        location: r.location || undefined,
        images: r.images || [],
        createdAt: Number(r.created_at) * 1000,
        analysis: {
          summary: r.analysis?.summary || "",
          reasoning: r.analysis?.reasoning || "",
          keyFacts: r.analysis?.key_facts || [],
          evidenceConsistency: r.analysis?.evidence_consistency || 0,
          riskIndicators: r.analysis?.risk_indicators || [],
          financialImpact: r.analysis?.financial_impact || "",
          publicImpact: r.analysis?.public_impact || "",
          confidence: r.analysis?.confidence || 0,
        },
        validators: (r.validators || []).map((v) => ({
          name: v.name,
          severity: v.severity as Severity,
          score: v.score,
          confidence: v.confidence,
          reasoning: v.reasoning,
        })),
        consensus: {
          severity: r.consensus?.severity as Severity || "Low",
          score: r.consensus?.score || 0,
          confidence: r.consensus?.confidence || 0,
        },
        txHash: r.tx_hash || "",
        blockNumber: Number(r.block_number) || 0,
      }));
    } catch {
      // fallback to local
    }
  }
  return local.loadCases();
}

export async function loadCaseById(id: string): Promise<CaseRecord | undefined> {
  if (isContractConfigured()) {
    try {
      const r = await withTimeout(chain.getCase(id), 10000);
      if (!r) return undefined;
      return {
        id: (r as any).id || r.case_id,
        hash: r.tx_hash,
        title: r.title,
        description: r.description,
        category: r.category as Category,
        estimatedDamage: r.estimated_damage,
        location: r.location || undefined,
        images: r.images || [],
        createdAt: Number(r.created_at) * 1000,
        analysis: {
          summary: r.analysis?.summary || "",
          reasoning: r.analysis?.reasoning || "",
          keyFacts: r.analysis?.key_facts || [],
          evidenceConsistency: r.analysis?.evidence_consistency || 0,
          riskIndicators: r.analysis?.risk_indicators || [],
          financialImpact: r.analysis?.financial_impact || "",
          publicImpact: r.analysis?.public_impact || "",
          confidence: r.analysis?.confidence || 0,
        },
        validators: (r.validators || []).map((v) => ({
          name: v.name,
          severity: v.severity as Severity,
          score: v.score,
          confidence: v.confidence,
          reasoning: v.reasoning,
        })),
        consensus: {
          severity: r.consensus?.severity as Severity || "Low",
          score: r.consensus?.score || 0,
          confidence: r.consensus?.confidence || 0,
        },
        txHash: r.tx_hash || "",
        blockNumber: Number(r.block_number) || 0,
      };
    } catch {
      return local.getCase(id);
    }
  }
  return local.getCase(id);
}

export { deleteCase, loadProfile, saveProfile } from "./cases";
export type { Profile } from "./cases";

// --- Wallet ---

export async function connectWallet(): Promise<string> {
  return chain.connectWallet();
}

export function loadWallet(): string | null {
  return chain.loadWallet();
}

export function disconnectWallet() {
  chain.disconnectWallet();
}
