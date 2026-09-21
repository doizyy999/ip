import type { Config } from "tailwindcss";

// Tailwind v4 bersifat CSS-first (lihat app/globals.css @theme).
// File ini opsional, dipertahankan untuk kompatibilitas tooling.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
} satisfies Config;
