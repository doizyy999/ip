import IMEIChecker from "@/components/IMEIChecker";

export default function IMEIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cek IMEI</h1>
        <p className="text-sm text-muted-foreground">
          Validasi format & checksum IMEI, lihat kode TAC, dan cek status registrasi resmi di
          Indonesia. Tool edukasi — bukan untuk melacak lokasi perangkat.
        </p>
      </div>
      <IMEIChecker />
    </div>
  );
}
