export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "IPIntel";

export const IP_API_BASE = "http://ip-api.com/json";
export const IPINFO_BASE = "https://ipinfo.io";

export const CACHE_REVALIDATE_SECONDS = 3600; // 1 jam

export const GLOSSARY: { term: string; definition: string }[] = [
  { term: "IP Address", definition: "Alamat numerik unik yang mengidentifikasi perangkat di jaringan. IPv4: 32-bit (mis. 8.8.8.8), IPv6: 128-bit." },
  { term: "ISP", definition: "Internet Service Provider — perusahaan yang menyediakan koneksi internet, mis. Telkom, IndiHome, Biznet." },
  { term: "ASN", definition: "Autonomous System Number — nomor identitas jaringan besar (ISP/datacenter) dalam routing BGP global." },
  { term: "Reverse DNS (PTR)", definition: "Pemetaan balik IP -> hostname. Kebalikan dari DNS biasa (hostname -> IP)." },
  { term: "Geolocation", definition: "Estimasi lokasi fisik sebuah IP berdasarkan database registrasi & routing, bukan GPS." },
  { term: "VPN", definition: "Virtual Private Network — mengenkripsi traffic dan membuat IP publikmu tampak berasal dari server VPN." },
  { term: "Proxy", definition: "Server perantara yang meneruskan request-mu sehingga IP asli tersembunyi." },
  { term: "Tor", definition: "Jaringan anonymisasi berlapis (onion routing). Exit node Tor terlihat sebagai IP publikmu." },
  { term: "Hosting / Datacenter IP", definition: "IP milik server/cloud (AWS, GCP, dll), bukan pengguna rumahan. Sering dipakai bot & VPN." },
  { term: "NAT / CGNAT", definition: "Banyak pengguna berbagi satu IP publik. Umum di jaringan mobile — satu IP bisa mewakili ribuan orang." },
  { term: "WHOIS", definition: "Protokol query database registrasi IP/domain: pemilik blok IP, organisasi, kontak abuse." },
  { term: "Latency", definition: "Waktu tempuh paket (ms) dari perangkatmu ke server. Dipengaruhi jarak fisik & kualitas routing." }
];

// Dummy data untuk Analytics (edukasi visualisasi)
export const DUMMY_TOP_COUNTRIES = [
  { country: "Indonesia", code: "ID", visits: 4210 },
  { country: "United States", code: "US", visits: 3180 },
  { country: "Singapore", code: "SG", visits: 1940 },
  { country: "Japan", code: "JP", visits: 1520 },
  { country: "Germany", code: "DE", visits: 1175 },
  { country: "India", code: "IN", visits: 1040 },
  { country: "Australia", code: "AU", visits: 890 },
  { country: "Netherlands", code: "NL", visits: 760 },
  { country: "Brazil", code: "BR", visits: 620 },
  { country: "United Kingdom", code: "GB", visits: 555 }
];

export const DUMMY_ISP_DIST = [
  { name: "Telkom Indonesia", value: 34 },
  { name: "IndiHome", value: 22 },
  { name: "Biznet", value: 12 },
  { name: "XL Axiata", value: 10 },
  { name: "Cloudflare", value: 9 },
  { name: "Google Cloud", value: 7 },
  { name: "Lainnya", value: 6 }
];

export const DUMMY_HOURLY_TRAFFIC = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  requests: Math.round(120 + 700 * Math.exp(-Math.pow(h - 14, 2) / 18) + 400 * Math.exp(-Math.pow(h - 21, 2) / 12) + Math.random() * 40)
}));
