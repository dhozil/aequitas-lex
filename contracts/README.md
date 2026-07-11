# Aequitas Lex — GenLayer Intelligent Contract

Satu file contract, semua fitur: case registry, AI analysis, multi-validator consensus, severity scoring.

## File

| File | Deskripsi |
|------|-----------|
| `AequitasLex.gen.py` | **Contract utama** — full set fitur |

## Fitur

### Write Methods (memodifikasi state on-chain)
| Method | Dekorator | Deskripsi |
|--------|-----------|-----------|
| `submit_case()` | `@gl.public.write` | Submit kasus, analysis deterministik (FNV-1a), 3 validator consensus |
| `submit_case_with_llm()` | `@gl.public.write` | Submit kasus dengan **true AI consensus** — leader jalankan LLM, validator **independen re-run LLM**, bandingkan decision fields (`severity_score`, `confidence`, `evidence_consistency`) dengan toleransi numerik via `run_nondet_unsafe`. Jika gagal, fallback ke deterministik |
| `delete_case()` | `@gl.public.write` | Hapus kasus (hanya oleh submitter atau owner) |

### View Methods (gas-free reads)
| Method | Deskripsi |
|--------|-----------|
| `get_case(case_id)` | Ambil CaseRecord lengkap |
| `get_case_summary(case_id)` | Ringkasan JSON (hash, title, severity, score, dll) |
| `get_case_count()` | Total kasus |
| `get_all_case_ids(offset, limit)` | List case IDs dengan pagination |
| `get_cases_paginated(offset, limit)` | List CaseRecord dengan pagination |
| `get_cases_by_submitter(address)` | Filter by submitter address |
| `get_cases_by_severity(severity)` | Filter by severity (Low/Medium/High/Critical) |
| `get_cases_by_category(category)` | Filter by category |
| `get_statistics()` | Statistik agregat JSON |
| `preview_analysis(...)` | Preview analysis tanpa on-chain storage |

## Contract Address (Bradbury)

| Network | Address |
|---------|---------|
| Testnet Bradbury | `0x8bE78143BBC6dEC8Dd14a69E43A65e5a66aB2299` |

Explorer: https://explorer.genlayer.com/address/0x8bE78143BBC6dEC8Dd14a69E43A65e5a66aB2299

## Deploy Ulang / Deploy Baru

Via **GenLayer Studio**: https://studio.genlayer.com/contracts
Atau **Shipyard**: https://genshipyard.com/deploy

1. Upload `AequitasLex.gen.py`
2. Pilih **Testnet Bradbury** (atau Studionet untuk development)
3. Deploy → copy contract address baru
4. Update `VITE_AEQUITAS_CONTRACT=0x...` di frontend `.env`

## Hubungkan Frontend

```bash
npm install genlayer-js
```

```ts
import { submitCase } from "@/lib/genlayer-client";

const result = await submitCase({
  title: "Warehouse Theft",
  description: "...",
  category: "Theft",
  estimatedDamage: 15000,
  images: [],
});
```

## Data Structures

```
CaseRecord
├── id / case_hash / tx_hash / block_number / submitter
├── title / description / category
├── estimated_damage / location / images[]
├── created_at (unix timestamp)
├── analysis (AIAnalysis)
│   ├── summary, key_facts[], evidence_consistency
│   ├── risk_indicators[], financial_impact, public_impact
│   └── confidence
├── validators[] (3x ValidatorVerdict)
│   ├── name (Solon/Cicero/Ulpian)
│   ├── severity / score / confidence / reasoning
└── consensus (ConsensusResult)
    └── severity / score / confidence
```

## Severity Model

| Level | Score | Keterangan |
|-------|-------|------------|
| Low | 0–37 | Minor impact |
| Medium | 38–61 | Moderate impact |
| High | 62–81 | Significant impact |
| Critical | 82–100 | Severe, extreme harm |
