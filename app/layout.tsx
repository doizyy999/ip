import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "IPIntel — IP & Network Intelligence",
  description: "Educational cybersecurity tool untuk analisis IP address & network intelligence."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans cyber-grid min-h-screen`}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">{children}</main>
        <Toaster richColors position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
