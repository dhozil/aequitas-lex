import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export type ConsensusResult = {
  severity: "Low" | "Medium" | "High" | "Critical";
  score: number;
  confidence: number;
};

export type SubmitResult = {
  case_id: string;
  case_hash: string;
  tx_hash: string;
  consensus: ConsensusResult;
};

export type CaseRecord = {
  case_id: string;
  title: string;
  description: string;
  category: string;
  estimated_damage: number;
  location: string;
  images: string[];
  created_at: number;
  case_hash?: string;
  analysis: {
    summary: string;
    reasoning: string;
    key_facts: string[];
    evidence_consistency: number;
    risk_indicators: string[];
    financial_impact: string;
    public_impact: string;
    confidence: number;
  };
  validators: {
    name: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    score: number;
    confidence: number;
    reasoning: string;
  }[];
  consensus: {
    severity: "Low" | "Medium" | "High" | "Critical";
    score: number;
    confidence: number;
  };
  tx_hash: string;
  block_number: number;
  submitter: string;
};

export type Statistics = {
  total_cases: number;
  by_category: Record<string, number>;
  by_severity: Record<string, number>;
  avg_score: number;
  avg_confidence: number;
};

let _readClient: ReturnType<typeof createClient> | null = null;

function getReadClient() {
  if (_readClient) return _readClient;
  // Use MetaMask provider when available (browser) to avoid CORS issues
  const provider = typeof window !== "undefined" ? (window as any).ethereum : undefined;
  if (provider) {
    _readClient = createClient({ chain: testnetBradbury, provider });
  } else {
    _readClient = createClient({ chain: testnetBradbury });
  }
  return _readClient;
}

const BRADBURY_CHAIN_ID = "0x107d";

async function ensureCorrectNetwork(provider: any) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId?.toLowerCase() === BRADBURY_CHAIN_ID) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BRADBURY_CHAIN_ID }] });
  } catch (e: any) {
    if (e.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: BRADBURY_CHAIN_ID,
          chainName: "GenLayer Bradbury Testnet",
          rpcUrls: ["https://rpc-bradbury.genlayer.com"],
          nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          blockExplorerUrls: ["https://explorer.genlayer.com"],
        }],
      });
    } else throw e;
  }
}

const CONTRACT_ADDRESS = import.meta.env.VITE_AEQUITAS_CONTRACT || "";

export function getContractAddress(): string {
  return (globalThis as any).__aequitas_contract || CONTRACT_ADDRESS;
}

export function setContractAddress(addr: string) {
  (globalThis as any).__aequitas_contract = addr;
}

export function isContractConfigured(): boolean {
  return !!getContractAddress();
}

// --- WRITE methods ---

async function writeAndWait(client: ReturnType<typeof createClient>, account: `0x${string}`, fn: string, args: unknown[]): Promise<{ txHash: string; receipt: any }> {
  const contractAddr = getContractAddress();
  const txHash = (await client.writeContract({
    account: { address: account } as any,
    address: contractAddr as `0x${string}`,
    functionName: fn,
    args: args as never[],
    value: 0n,
  })) as string;

  const RETRYABLE = ["LEADER_TIMEOUT", "PENDING", "PROPOSING", "WAITING", "COMMITTING", "REVEALING"];

  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const receipt = await (client as any).waitForTransactionReceipt({
        hash: txHash,
        retries: 1,
        interval: 2000,
        timeout: 5000,
        fullTransaction: true,
      });

      const statusName = (receipt as any).statusName as string | undefined;
      const txResultName = (receipt as any).txExecutionResultName as string | undefined;

      if (statusName === "ACCEPTED") {
        if (txResultName === "FAIL" || txResultName === "FINISHED_WITH_ERROR") {
          throw new Error("Contract execution failed");
        }
        return { txHash, receipt };
      }

      if (txResultName && RETRYABLE.includes(txResultName)) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      if (statusName && RETRYABLE.includes(statusName)) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("Timed out") || msg.includes("timeout") || msg.includes("TIMEOUT") || msg.includes("PENDING") || msg.includes("PROPOSING") || msg.includes("COMMITTING") || msg.includes("REVEALING") || msg.includes("LEADER_TIMEOUT")) {
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }
      throw e;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Transaction did not reach ACCEPTED within timeout");
}

async function writeSubmit(fn: string, params: {
  title: string; description: string; category: string; estimatedDamage: number; location?: string; images: string;
}): Promise<SubmitResult> {
  if (!getContractAddress()) throw new Error("Contract address not configured");
  const provider = getProvider();
  if (!provider) throw new Error("No EVM wallet detected.");
  const accounts: `0x${string}`[] = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.[0]) throw new Error("No wallet connected");
  const client = createClient({ chain: testnetBradbury, provider, account: accounts[0] as any });
  try {
    await (client as any).connect("testnetBradbury");
  } catch {
    await ensureCorrectNetwork(provider);
    (client as any).chain = testnetBradbury;
  }
  const { txHash, receipt } = await writeAndWait(client, accounts[0], fn, [params.title, params.description, params.category, params.estimatedDamage, params.location || "", params.images]);

  // Poll contract state and check for errors
  const submitter = accounts[0].toLowerCase();
  const readClient = getReadClient();
  const contractAddr = getContractAddress() as `0x${string}`;

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));

    // check if contract stored an error
    try {
      const errMsg: string = await readClient.readContract({
        address: contractAddr,
        functionName: "get_last_error",
        args: [fn],
      }) as string;
      if (errMsg) throw new Error(errMsg);
    } catch (e: any) {
      if (e?.message?.startsWith("Transaction accepted")) throw e;
      const msg = e?.message || "";
      if (msg.includes("contract") || msg.includes("revert") || msg.includes("readContract")) continue;
      throw e;  // real LLM error from contract → surface to user
    }

    // check if the case appeared
    try {
      const ids: string[] = await getCasesBySubmitter(submitter);
      if (ids.length > 0) {
        const caseId = ids[ids.length - 1];
        const record = await getCase(caseId);
        if (record) {
          return {
            case_id: record.case_id || caseId,
            case_hash: record.case_hash || txHash,
            tx_hash: txHash,
            consensus: record.consensus || { severity: "Low", score: 0, confidence: 0 },
          };
        }
      }
    } catch { /* keep polling */ }
  }
  throw new Error("Transaction accepted but case not found on contract");
}

export async function submitCase(params: {
  title: string; description: string; category: string; estimatedDamage: number; location?: string; images: string;
}): Promise<SubmitResult> {
  return writeSubmit("submit_case", params);
}

export async function submitCaseWithLLM(params: {
  title: string; description: string; category: string; estimatedDamage: number; location?: string; images: string;
}): Promise<SubmitResult> {
  return writeSubmit("submit_case_with_llm", params);
}

// --- READ methods ---

export async function getCase(caseId: string): Promise<CaseRecord | null> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_case",
    args: [caseId],
  });
  if (!result) return null;
  const raw = JSON.parse(result as string);
  return { ...raw, case_id: raw.id || raw.case_id };
}

export async function getCaseSummary(caseId: string): Promise<{
  case_id: string;
  title: string;
  severity: string;
  score: number;
  confidence: number;
} | null> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_case_summary",
    args: [caseId],
  });
  if (!result) return null;
  return JSON.parse(result as string);
}

export async function getCasesPaginated(offset = 0, limit = 20): Promise<CaseRecord[]> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_cases_paginated",
    args: [offset, limit],
  });
  if (!result) return [];
  const records = result as any[];
  return records.map((r: any) => ({ ...r, case_id: r.id || r.case_id }));
}

export async function getCasesByCategory(category: string): Promise<CaseRecord[]> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_cases_by_category",
    args: [category],
  });
  if (!result) return [];
  return result as any[];
}

export async function getCasesBySeverity(severity: string): Promise<CaseRecord[]> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_cases_by_severity",
    args: [severity],
  });
  if (!result) return [];
  return result as any[];
}

export async function getCasesBySubmitter(submitter: string): Promise<string[]> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_cases_by_submitter",
    args: [submitter],
  });
  if (!result) return [];
  return result as string[];
}

export async function getStatistics(): Promise<Statistics | null> {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "get_statistics",
    args: [],
  });
  if (!result) return null;
  return JSON.parse(result as string);
}

export async function previewAnalysis(params: {
  title: string;
  description: string;
  category: string;
  estimatedDamage: number;
  location?: string;
  evidenceCount: number;
}) {
  const addr = getContractAddress();
  if (!addr) throw new Error("Contract address not configured");

  const c = getReadClient();
  const result = await c.readContract({
    address: addr as `0x${string}`,
    functionName: "preview_analysis",
    args: [
      params.title,
      params.description,
      params.category,
      params.estimatedDamage,
      params.location || "",
      params.evidenceCount,
    ],
  });
  if (!result) return null;
  return JSON.parse(result as string);
}

// --- Wallet (EIP-1193 — works with MetaMask, Rabby, Brave, Coinbase, dll.) ---

const WALLET_STORAGE_KEY = "aequitas_wallet_v1";

function getProvider() {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum ?? null;
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error("No EVM wallet detected. Install MetaMask, Rabby, or another EVM wallet.");

  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) throw new Error("Wallet connection rejected.");

  const addr = accounts[0].toLowerCase();
  localStorage.setItem(WALLET_STORAGE_KEY, addr);
  window.dispatchEvent(new CustomEvent("aequitas:wallet-changed"));

  await ensureCorrectNetwork(provider);

  return addr;
}

export function loadWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_STORAGE_KEY);
}

export function disconnectWallet() {
  localStorage.removeItem(WALLET_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("aequitas:wallet-changed"));
}

export function getWalletAddress(): string | null {
  return loadWallet();
}
