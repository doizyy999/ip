"use client";

import { Button } from "@/components/ui/button";
import { FileText, Activity, AlertTriangle, Clock, Network } from "lucide-react";

const ACTIONS = [
  { icon: FileText, label: "Bikin laporan lengkap", prompt: "Bikin laporan lengkap dari data scan ini: ringkasan eksekutif, temuan per modul, risk assessment, rekomendasi." },
  { icon: Activity, label: "Cari pola aktivitas", prompt: "Cari pola aktivitas dari data ini: jam aktif, platform dominan, konsistensi perilaku." },
  { icon: AlertTriangle, label: "Deteksi red flag", prompt: "Deteksi red flag dari data ini: indikator akun fake, anomali, inkonsistensi identitas." },
  { icon: Clock, label: "Bikin timeline naratif", prompt: "Ubah data ini jadi timeline naratif kronologis yang mudah dibaca." },
  { icon: Network, label: "Cari koneksi antar akun", prompt: "Cari koneksi antar akun/entitas di data ini: email sama, username mirip, organisasi sama." },
];

export function QuickActions({ onPick, disabled }: { onPick: (p: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((a) => (
        <Button key={a.label} variant="outline" size="sm" disabled={disabled} onClick={() => onPick(a.prompt)}>
          <a.icon className="mr-1 h-3.5 w-3.5 text-cyber-purple" />
          {a.label}
        </Button>
      ))}
    </div>
  );
}
