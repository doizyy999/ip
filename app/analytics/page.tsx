import { TopCountriesChart, ISPDistributionChart, HourlyTrafficChart } from "@/components/Charts";

export const metadata = { title: "Analytics — IPIntel" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Network Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Simulasi edukasi: cara memvisualisasikan data network intelligence. Semua data di
          halaman ini dummy, tujuannya mengajarkan konsep visualisasi data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCountriesChart />
        <ISPDistributionChart />
        <HourlyTrafficChart />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        <h2 className="mb-2 font-semibold text-foreground">Yang bisa dipelajari dari chart ini</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Bar chart cocok untuk membandingkan kategori (negara dengan traffic terbanyak).</li>
          <li>Pie chart menunjukkan proporsi — mis. pangsa ISP di antara pengunjung.</li>
          <li>Line chart mengungkap pola waktu — jam sibuk (peak hour) biasanya sore & malam.</li>
          <li>Di dunia nyata, data seperti ini dikumpulkan dari log server lalu dikelompokkan per IP/ASN.</li>
        </ul>
      </div>
    </div>
  );
}
