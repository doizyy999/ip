import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import { Radar } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jbmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });

export const metadata: Metadata = {
  title: "TRACE — Digital Footprint Analyzer",
  description:
    "Agregator informasi publik & analisis jejak digital untuk riset dan OSINT analyst training.",
};

const NAV = [
  { href: "/", label: "Search" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ai", label: "AI" },
  { href: "/about", label: "About" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.variable} ${jbmono.variable} min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased`}
      >
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-cyber-cyan" />
              <span className="font-mono text-lg font-bold tracking-widest text-cyber-cyan glow-cyan">
                TRACE
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-cyber-cyan"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 pb-20">{children}</main>
        <Toaster theme="dark" richColors position="bottom-right" />
      </body>
    </html>
  );
}
