# Aequitas Lex

> **Justice Through Intelligent Reasoning**

Aequitas Lex adalah platform asesmen kasus hukum berbasis AI dengan estetika premium (matte black, gold, dan marble). Platform ini mensimulasikan alur kerja *Intelligent Contract* — mulai dari pengajuan kasus, analisis AI, konsensus multi-validator, hingga pencatatan metadata on-chain yang transparan.

> **Catatan penting:** Aequitas Lex **tidak** menentukan kesalahan atau mengeluarkan putusan hukum. Sistem ini hanya memberikan rekomendasi tingkat keparahan (*severity*) yang dapat dijelaskan dan dapat diaudit untuk membantu penyidik, analis, dan badan administratif.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Stack Teknologi](#stack-teknologi)
- [Struktur Project](#struktur-project)
- [Halaman & Alur](#halaman--alur)
- [Cara Menjalankan](#cara-menjalankan)
- [Konsep & Model](#konsep--model)
- [Catatan Teknis](#catatan-teknis)

---

## Fitur Utama

- **Landing Page** — Hero visual, penjelasan nilai, alur kerja, dan FAQ.
- **Dashboard** — Ringkasan statistik kasus, distribusi kategori, dan kasus terbaru.
- **Create Case** — Formulir pengajuan kasus dengan judul, deskripsi, kategori, estimasi kerugian, lokasi, dan hingga 5 gambar bukti.
- **Case Ledger** — Daftar kasus yang dapat dicari dan disaring berdasarkan kategori/tingkat keparahan.
- **Case Detail** — Tampilan mendalam analisis AI, pernyataan setiap validator, konsensus, serta metadata hash & transaksi.
- **Severity History** — Timeline grafik perkembangan skor keparahan kasus.
- **Profile** — Identitas pengguna (display name, role, jurisdiction) dan simulasi wallet connection.
- **Documentation** — Dokumentasi arsitektur, model keparahan, dan jaminan transparansi.

---

## Stack Teknologi

- **Framework:** TanStack Start v1 + React 19
- **Routing:** TanStack Router (file-based)
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **State & UI:** React, TanStack Query, shadcn/ui components, Sonner toast
- **Ikon:** Lucide React
- **Storage:** `localStorage` untuk persistensi kasus, profil, dan wallet

---

## Struktur Project

```text
src/
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── gold-particles.tsx # Efek partikel emas di latar
│   ├── severity-badge.tsx # Badge tingkat keparahan
│   └── site-header.tsx    # Header navigasi
├── lib/
│   ├── cases.ts           # Logika analisis, tipe data, localStorage
│   └── utils.ts           # Utility umum
├── routes/
│   ├── __root.tsx         # Root layout
│   ├── index.tsx          # Landing page
│   ├── docs.tsx           # Dokumentasi
│   ├── dashboard.tsx      # Layout dashboard
│   ├── dashboard.index.tsx       # Overview dashboard
│   ├── dashboard.create.tsx      # Buat kasus baru
│   ├── dashboard.cases.tsx       # Daftar kasus
│   ├── dashboard.cases.$id.tsx   # Detail kasus
│   ├── dashboard.history.tsx     # Riwayat severity
│   └── dashboard.profile.tsx     # Profil pengguna
├── styles.css             # Tema premium Aequitas Lex
└── router.tsx             # Bootstrap router
```

---

## Halaman & Alur

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Beranda | `/` | Hero, fitur, how it works, FAQ |
| Dokumentasi | `/docs` | Referensi arsitektur & severity model |
| Dashboard | `/dashboard` | Layout navigasi utama |
| Overview | `/dashboard/` | Statistik & ringkasan |
| Create Case | `/dashboard/create` | Formulir pengajuan kasus + analisis AI |
| Case Ledger | `/dashboard/cases` | Tabel/listing seluruh kasus |
| Case Detail | `/dashboard/cases/:id` | Analisis mendalam & metadata |
| Severity History | `/dashboard/history` | Grafik timeline skor |
| Profile | `/dashboard/profile` | Identitas & wallet |

---

## Cara Menjalankan

1. **Install dependensi**

```bash
bun install
```

2. **Jalankan mode pengembangan**

```bash
bun run dev
```

3. **Build untuk production**

```bash
bun run build
```

4. **Preview production build**

```bash
bun run preview
```

---

## Konsep & Model

### AI Reasoning

Setiap kasus dianalisis berdasarkan:

- Summary dan Key Facts
- Evidence Consistency
- Risk Indicators
- Financial Impact
- Public Impact
- Confidence Score

### Validator

Tiga validator independen mensimulasikan perspektif berbeda:

- **Solon** — Bobot bukti prosedural
- **Cicero** — Besar kecil kerugian dan indikasi niat
- **Ulpian** — Kesesuaian preseden dan norma yurisdiksi

### Model Severity

| Tingkat | Rentang Skor | Keterangan |
|---------|--------------|------------|
| Low | 0–37 | Dampak ringan, risiko rendah |
| Medium | 38–61 | Dampak sedang, kerugian terlihat |
| High | 62–81 | Dampak signifikan, kerugian serius |
| Critical | 82–100 | Dampak berat, risiko ekstrem |

---

## Catatan Teknis

- Semua data kasus disimpan secara lokal di `localStorage`.
- Wallet address adalah simulasi deterministik; tidak terhubung ke blockchain nyata.
- Hash dan transaksi hash pada metadata adalah simulasi untuk menunjukkan transparansi on-chain.
- Tema visual menggunakan palet warna OKLCH (`--gold`, `--marble`, `--onyx`) dengan efek blur, gradien, dan animasi partikel.

---

Dibuat untuk ekosistem GenLayer Intelligent Contracts — tampilan, alur, dan estetika disesuaikan dengan visi project yang dilampirkan.
