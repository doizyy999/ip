import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BookOpen, Scale } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-12">
      <h1 className="font-mono text-3xl font-bold tracking-widest text-cyber-cyan glow-cyan">
        ABOUT TRACE
      </h1>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyber-purple">
            <BookOpen className="h-5 w-5" /> Apa ini?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          <p>
            TRACE adalah tool agregasi data publik &amp; analisis jejak digital untuk
            keperluan <b className="text-zinc-200">riset, portfolio, dan OSINT analyst training</b>.
          </p>
          <p>
            Semua data diambil dari sumber publik &amp; API resmi: HTTP status publik platform,
            DNS/WHOIS, crt.sh, archive.org, Gravatar, GitHub API, Reddit, Dev.to, Medium RSS,
            Google News RSS, dan AI Groq untuk analisis.
          </p>
          <p>Modul: Username Scanner, Email Intelligence, Phone Intelligence, Domain Inspector,
            Image Metadata, Public Records, Social Scanner, Relationship Graph, Timeline Builder,
            dan AI Assistant.</p>
        </CardContent>
      </Card>

      <Card className="border-cyber-pink/40 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyber-pink">
            <ShieldAlert className="h-5 w-5" /> Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          <p className="rounded-md border border-cyber-pink/30 bg-cyber-pink/5 p-3 text-zinc-200">
            &quot;TRACE adalah tool agregasi data publik untuk riset &amp; edukasi. Semua data
            diambil dari sumber publik &amp; API resmi. Pengguna bertanggung jawab penuh atas
            penggunaan tool ini.&quot;
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Tidak ada bypass login, CAPTCHA, atau data privat.</li>
            <li>Tidak menampilkan nama pemilik nomor, alamat, atau NIK.</li>
            <li>Hasil scan bersifat indikatif — selalu verifikasi manual.</li>
            <li>Dilarang dipakai untuk doxxing, stalking, atau harassment.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyber-cyan">
            <Scale className="h-5 w-5" /> Lisensi
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">MIT License. Fork, modifikasi, pelajari.</CardContent>
      </Card>
    </div>
  );
}
