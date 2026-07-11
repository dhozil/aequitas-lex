# Aequitas Lex

> **Justice Through Intelligent Reasoning** — AI-powered legal severity assessment on GenLayer.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/start/latest)
[![GenLayer](https://img.shields.io/badge/GenLayer-Bradbury-7B3FE4?logo=genlayer&logoColor=white)](https://genlayer.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com/)

Aequitas Lex adalah platform asesmen keparahan kasus hukum yang menggunakan **GenLayer Intelligent Contracts** dengan AI-validator consensus. Setiap kasus dianalisis oleh LLM secara independen oleh leader dan validator, lalu mencapai konsensus melalui **Equivalence Principle** (`run_nondet_unsafe`).

Platform ini hanya memberikan rekomendasi tingkat keparahan (*severity*) yang dapat dijelaskan dan diaudit — bukan putusan hukum atau penentuan kesalahan.

---

## Features

- **Landing Page** — Hero visual, nilai platform, alur kerja, FAQ.
- **Dashboard** — Overview statistik, distribusi kategori, kasus terbaru.
- **Create Case** — Formulir pengajuan dengan analisis AI via GenLayer consensus.
- **Case Ledger** — Daftar kasus dengan filter/search.
- **Case Detail** — Overlay analisis AI, reasoning, validator consensus, on-chain metadata.
- **Severity History** — Timeline grafik skor keparahan.
- **Profile** — Identitas pengguna dengan koneksi wallet (EIP-1193).

---

## Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | TanStack Start v1 + React 19 |
| **Routing** | TanStack Router (file-based) |
| **Styling** | Tailwind CSS v4 + OKLCH custom properties |
| **AI Consensus** | GenLayer – `run_nondet_unsafe` + `exec_prompt` |
| **Blockchain** | GenLayer Bradbury testnet (chain: 4221) |
| **Wallet** | EIP-1193 (any EVM wallet) |
| **UI** | shadcn/ui, Sonner, Lucide, Recharts |
| **Deploy** | Cloudflare Pages (via Nitro preset `cloudflare-pages`) |

---

## Project Structure

```
aequitas-lex/
├── contracts/
│   └── AequitasLex.py          # GenLayer Intelligent Contract
├── public/
│   └── favicon.svg
├── scripts/
│   └── check-schema.mjs        # Contract schema inspection
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── severity-badge.tsx
│   │   ├── site-header.tsx
│   │   └── gold-particles.tsx
│   ├── lib/
│   │   ├── genlayer-client.ts  # GenLayer chain interactions
│   │   ├── genlayer-service.ts # Bridge service (chain + localStorage fallback)
│   │   ├── cases.ts            # Analysis logic, types, local mock
│   │   ├── error-capture.ts    # SSR error capture
│   │   ├── error-page.ts       # Fallback error page
│   │   └── utils.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx           # Landing page
│   │   ├── docs.tsx            # Documentation
│   │   ├── dashboard.tsx       # Dashboard layout
│   │   ├── dashboard.index.tsx # Overview
│   │   ├── dashboard.create.tsx # Create case
│   │   ├── dashboard.cases.tsx # Case ledger (inline detail overlay)
│   │   ├── dashboard.cases.$id.tsx
│   │   ├── dashboard.history.tsx
│   │   └── dashboard.profile.tsx
│   ├── styles.css              # Premium theme (onyx, gold, marble)
│   ├── server.ts               # Cloudflare Workers entry
│   ├── start.ts                # TanStack Start config
│   └── router.tsx
├── .env                        # VITE_AEQUITAS_CONTRACT
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## The Intelligent Contract

**`contracts/AequitasLex.py`** — deployed on GenLayer Bradbury testnet.

### Consensus Flow

```
      ┌──────────────┐
      │  Case Data   │
      └──────┬───────┘
             ▼
     ┌───────────────┐
     │  Leader (LLM) │  ← gl.nondet.exec_prompt (analysis + severity)
     └───────┬───────┘
             ▼
     ┌───────────────┐
     │  Validators   │  ← 3 independent LLM re-runs
     │  (x3)         │  ← score_diff ≤ 5, conf_diff ≤ 10,
     └───────┬───────┘     ev_diff ≤ 15
             ▼
     ┌───────────────┐
     │  Storage      │  ← Only written after consensus
     └───────────────┘
```

- **Write methods never raise** — errors disimpan di `last_error[fn]`, dibaca via `get_last_error(fn)`.
- **No silent deterministic fallback** — jika LLM consensus gagal, error disimpan dan disurface ke user.
- **Validator** independently re-run `exec_prompt`, bukan cek struktur JSON leader.
- **Themes**: [Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle) — Pattern 2: Numeric Tolerance.

### Severity Model

| Level | Score Range |
|-------|------------|
| Low | 0–37 |
| Medium | 38–61 |
| High | 62–81 |
| Critical | 82–100 |

### Validator Lenses

| Validator | Focus |
|-----------|-------|
| **Solon** | Procedural evidence weight & chain-of-custody rigor |
| **Cicero** | Harm magnitude, victim impact, and intent signals |
| **Ulpian** | Precedent alignment, jurisdictional norms, legal proportionality |

---

## Getting Started

**Prerequisites:** Node.js 20+, npm, wallet (MetaMask or any EIP-1193).

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Connect to Bradbury

1. Add network to wallet:
   - **Network:** Bradbury
   - **RPC:** `https://bradbury.genlayer.org/`
   - **Chain ID:** `4221` (hex: `0x107D`)
   - **Currency:** GEN

2. Set contract address in `.env`:
   ```
   VITE_AEQUITAS_CONTRACT=0x51746305510c31D91F8D397cD70d6599696471E9
   ```

---

## Deployment

### Via GitHub Integration

Di dashboard Cloudflare Pages → "Create a project" → hubungkan repo `dhozil/aequitas-lex`:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | **`dist`** |

Set environment variables:

### Via CLI

```bash
npm run build
npx wrangler pages deploy dist/
```

### Environment Variables

Set di dashboard Cloudflare Pages:

| Key | Value |
|-----|-------|
| `VITE_AEQUITAS_CONTRACT` | `0x51746305510c31D91F8D397cD70d6599696471E9` |

---

## Design

- **Palette:** OKLCH — gold (`oklch(0.88 0.09 85)`), marble (`oklch(0.92 0.01 85)`), onyx (`oklch(0.15 0.01 85)`)
- **Typography:** serif headings, sans-serif body (system stack)
- **Effects:** backdrop blur, glassmorphism panels, animated gold particles
- **Philosophy:** Modern classic — clean, restrained, premium.

---

Built for GenLayer Intelligent Contracts.
