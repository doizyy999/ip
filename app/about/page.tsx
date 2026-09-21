import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GLOSSARY } from "@/lib/constants";
import { BookOpen, MapPin, ShieldQuestion } from "lucide-react";

export const metadata = { title: "About — IPIntel" };

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tentang & Edukasi</h1>
        <p className="text-sm text-muted-foreground">
          IPIntel adalah tool edukasi untuk memahami cara kerja IP geolocation & network intelligence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Cara Kerja IP Geolocation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            IP geolocation <span className="text-foreground">bukan GPS</span>. Tidak ada satelit yang
            melacak IP address. Yang terjadi: blok-blok IP dialokasikan ke organisasi (ISP, datacenter,
            kampus) lewat registrasi regional (APNIC, ARIN, RIPE, dll). Database geolocation seperti
            ip-api & ipinfo mengumpulkan data registrasi ini, lalu memperkaya dengan data routing BGP,
            pengukuran latency, dan crowdsourcing.
          </p>
          <p>
            Alurnya: IP kamu → dicek masuk blok milik siapa → blok itu teregistrasi di kota/negara mana →
            itulah "lokasi" yang kamu lihat. Karena itu hasilnya adalah{" "}
            <span className="text-foreground">estimasi lokasi jaringan</span>, bukan lokasi fisik perangkat.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Kenapa Akurasi Cuma Sampai Level Kota?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-2">
            <li>
              <span className="text-foreground">Satu IP ≠ satu rumah.</span> ISP memakai NAT/CGNAT —
              ribuan pelanggan bisa berbagi satu IP publik.
            </li>
            <li>
              <span className="text-foreground">Registrasi mengikuti kantor ISP,</span> bukan lokasi
              pelanggan. IP pelanggan di Bandung bisa tercatat "Jakarta" karena kantor pusat ISP di sana.
            </li>
            <li>
              <span className="text-foreground">IP mobile berpindah-pindah.</span> Jaringan seluler
              men-assign IP dinamis dari pool besar lintas kota.
            </li>
            <li>
              Database tidak punya data per-rumah — dan memang seharusnya tidak, demi privasi.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldQuestion className="h-4 w-4 text-primary" />
            Kenapa VPN Bikin Hasil Ngaco?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Saat kamu pakai VPN, traffic-mu keluar lewat server VPN — jadi IP publik yang terlihat
            adalah <span className="text-foreground">IP server VPN</span>, bukan IP dari ISP rumahmu.
            Kalau server VPN-nya di Singapura, semua database geolocation akan bilang kamu di Singapura.
          </p>
          <p>
            Karena itu tool seperti IPIntel punya flag <span className="text-foreground">VPN/Proxy/Hosting</span>:
            IP milik datacenter (AWS, DigitalOcean, dsb.) yang umum dipakai server VPN akan ditandai.
            Ini contoh nyata konsep <span className="text-foreground">threat intelligence</span> —
            membedakan traffic pengguna asli vs traffic yang melewati perantara.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Glosarium Istilah Jaringan</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                <dt className="font-mono text-sm text-primary">{g.term}</dt>
                <dd className="text-sm text-muted-foreground">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Disclaimer: IPIntel dibuat untuk tujuan edukasi jaringan komputer. Jangan gunakan untuk
        melacak, menguntit, atau melanggar privasi orang lain. Lisensi MIT.
      </p>
    </div>
  );
}
