# TRACE — Public Information Aggregator & Digital Footprint Analyzer

Agregator jejak digital publik dari 1 input (username / email / phone / domain) untuk **riset, portfolio, dan OSINT analyst training**. Dark cyber theme, AI assistant via Groq, graph & timeline interaktif.

## Stack & Versi

| Paket | Versi |
|---|---|
| Next.js | 16.3.5 (App Router, Turbopack default) |
| React / React DOM | 19.3.0 |
| TypeScript | 5.7+ |
| Tailwind CSS | 4.x (via `@tailwindcss/postcss`) |
| react-leaflet | 5.0.0 |
| Recharts | 3.10.1 |
| Node.js | 20+ |
| groq-sdk | latest |

## Migration Notes (dari project `ipintel` user)

Project sumber sudah Next.js 16.3.5 + React 19.3.0 — pattern bisa langsung dipakai. Yang dimigrasikan:

1. **Tailwind 3.4.4 → 4.x**
   - Hapus `autoprefixer` + plugin `tailwindcss` dari postcss; ganti `@tailwindcss/postcss`.
   - `globals.css`: ganti `@tailwind base/components/utilities` → `@import "tailwindcss";` + token di `@theme {}`.
   - `tailwind.config.ts` jadi opsional (CSS-first config).
   - Hapus `tailwindcss-animate` (pakai framer-motion).
2. **TypeScript 5.4 → 5.7+**: update devDependency, tidak ada perubahan kode.
3. **`next.config.js` → `next.config.ts`**: typed `NextConfig`.
4. **React 19 patterns**: `ref` jadi prop biasa (tanpa `forwardRef`), Server Components default, `params` di page dynamic route adalah Promise → unwrap pakai `use()`.
5. **react-leaflet 5**: wajib `dynamic(..., { ssr: false })`, CSS leaflet di-import client-side (lihat `components/MapView.tsx`).
6. **Route handlers**: runtime Node.js default (dipakai untuk `dns`, `tls`, `whois-json`).

## Install & Run

```bash
npm install
cp .env.example .env.local   # isi APIKEY_GROQ
npm run dev                  # http://localhost:3000
```

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import di [vercel.com](https://vercel.com) → New Project.
3. Settings → Environment Variables:
   - `APIKEY_GROQ` = `gsk_xxx` (server-side only, **jangan** prefix NEXT_PUBLIC)
   - `NEXT_PUBLIC_APP_URL` = `https://trace.vercel.app`
   - `SERPAPI_KEY` (opsional), `HIBP_API_KEY` (opsional), `YOUTUBE_API_KEY` (opsional)
4. Redeploy.

Groq API key gratis: [console.groq.com/keys](https://console.groq.com/keys)

## Struktur Folder

```
trace/
├── app/
│   ├── layout.tsx / page.tsx          # shell + homepage search
│   ├── result/[id]/page.tsx           # hasil agregasi (tabs)
│   ├── dashboard/page.tsx             # history + AI insight
│   ├── ai/page.tsx                    # AI chat
│   ├── about/page.tsx                 # edukasi + disclaimer
│   └── api/                           # 12 route handlers (Node.js runtime)
├── components/                        # SearchBar, ProfileCard, TimelineView,
│   ├── ui/                            # RelationshipGraph, MapView, ResultTabs,
│   └── ai/                            # ExportButton + shadcn-style ui + ai/*
├── lib/                               # orchestrator, groq, rateLimit, cache,
│                                      # platforms (150+), utils, store
├── types/index.ts
└── .env.example / package.json / tsconfig / next.config.ts / tailwind.config.ts
```

## Modul

| # | Modul | Endpoint | Isi |
|---|---|---|---|
| 1 | Username Scanner | `/api/username` | 150+ platform, batch parallel, timeout 5s, Sherlock-style status detection |
| 2 | Email Intel | `/api/email` | RFC 5322 + MX (dns.promises), disposable list, Gravatar md5, GitHub search, risk score |
| 3 | Phone Intel | `/api/phone` | libphonenumber-js: E.164, negara, tipe, link WA/Telegram. Tanpa nama/alamat/NIK |
| 4 | Domain Inspector | `/api/domain` | WHOIS, DNS A/AAAA/MX/TXT/NS/CNAME/SOA, crt.sh subdomain, SSL via TLS socket, headers, tech stack, robots.txt, sitemap, Wayback, reverse IP, GA ID |
| 5 | Image Metadata | `/api/image` | EXIF (exifr), GPS → peta, deteksi stripped, reverse search links |
| 6 | Public Records | `/api/public-records` | Google News RSS + link direktori AHU/OSS/Putusan MA/SIPP/LKPM/DJKI |
| 7 | Social Scanner | `/api/social` | GitHub, Reddit, Dev.to, Medium RSS, YouTube (API resmi/halaman publik) + heuristik akun fake |
| 8 | Relationship Graph | `/api/graph` | Normalisasi node/edge → react-force-graph-2d |
| 9 | Timeline Builder | `/api/timeline` | Merge + dedupe + agregasi per bulan → Recharts |
| 10 | AI Assistant | `/api/chat`, `/api/analyze` | Groq streaming, quick actions, auto-analyze per modul |

## Rate Limit & Security

- Search modules: **5 req/menit/IP**; AI: **20 req/menit/IP** (in-memory, lihat `lib/rateLimit.ts`; ganti `@upstash/ratelimit` untuk multi-instance).
- Semua route divalidasi Zod; format error seragam `{ success, data, error }` + HTTP 429.
- Semua API key server-side only.
- Cache in-memory 1 jam per query (`lib/cache.ts`).

## Disclaimer

> TRACE adalah tool agregasi data publik untuk riset & edukasi. Semua data diambil dari sumber publik & API resmi. Pengguna bertanggung jawab penuh atas penggunaan tool ini.

Tidak ada bypass login/CAPTCHA, tidak ada data privat, tidak ada nama pemilik nomor/alamat/NIK. Dilarang untuk doxxing/stalking/harassment.

## Lisensi

MIT
