import { NextResponse } from "next/server";
import { z } from "zod";
import dns from "dns/promises";
import tls from "tls";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { cached } from "@/lib/cache";
import type { DomainIntel } from "@/types";

const schema = z.object({ query: z.string().min(3).max(253) });

function sslInfo(host: string): Promise<DomainIntel["ssl"]> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 6000);
    try {
      const socket = tls.connect(443, host, { servername: host, timeout: 5000 }, () => {
        clearTimeout(timer);
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || !cert.issuer) return resolve(null);
        const org = cert.issuer.O;
        const issuer = (Array.isArray(org) ? org[0] : org) ?? cert.issuer.CN;
        resolve({
          issuer,
          notBefore: cert.valid_from,
          notAfter: cert.valid_to,
        });
      });
      socket.on("error", () => { clearTimeout(timer); resolve(null); });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function whoisLookup(domain: string): Promise<Record<string, unknown> | null> {
  try {
    const whois = (await import("whois-json")).default;
    const raw = (await whois(domain, { timeout: 8000 })) as Record<string, unknown>;
    return {
      registrar: raw.registrar,
      createdDate: raw.creationDate ?? raw.createdDate,
      expiryDate: raw.registrarRegistrationExpirationDate ?? raw.expiryDate,
      updatedDate: raw.updatedDate,
      nameServers: raw.nameServer,
      status: raw.domainStatus,
    };
  } catch {
    return null;
  }
}

const TECH_SIGNATURES: [RegExp, string][] = [
  [/_next\//i, "Next.js"], [/wp-content|wordpress/i, "WordPress"],
  [/react/i, "React"], [/vue/i, "Vue.js"], [/jquery/i, "jQuery"],
  [/bootstrap/i, "Bootstrap"], [/tailwind/i, "Tailwind CSS"],
  [/cloudflare/i, "Cloudflare"], [/shopify/i, "Shopify"],
  [/wix\.com/i, "Wix"], [/squarespace/i, "Squarespace"],
  [/googletagmanager|gtag\(/i, "Google Tag Manager"],
  [/gtag\/js\?id=(G-[A-Z0-9]+)/i, "Google Analytics 4"],
];

export async function POST(req: Request) {
  const rl = rateLimit(`domain:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Domain invalid" }, { status: 400 });

  const domain = parsed.data.query.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];

  const data = await cached(`domain:${domain}`, 3600_000, async (): Promise<DomainIntel> => {
    const safeResolve = async (fn: () => Promise<unknown>) => {
      try { return await fn(); } catch { return null; }
    };

    const [whois, a, aaaa, mx, txt, ns, cname, soa, ssl, crtRes, httpRes, robotsRes, waybackRes, revIpRes] =
      await Promise.allSettled([
        whoisLookup(domain),
        safeResolve(() => dns.resolve4(domain)),
        safeResolve(() => dns.resolve6(domain)),
        safeResolve(() => dns.resolveMx(domain)),
        safeResolve(() => dns.resolveTxt(domain)),
        safeResolve(() => dns.resolveNs(domain)),
        safeResolve(() => dns.resolveCname(domain)),
        safeResolve(() => dns.resolveSoa(domain)),
        sslInfo(domain),
        fetch(`https://crt.sh/?q=%25.${domain}&output=json`).then((r) => (r.ok ? r.json() : [])),
        fetch(`https://${domain}`, { redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "TRACE/1.0" } }),
        fetch(`https://${domain}/robots.txt`, { signal: AbortSignal.timeout(5000) }),
        fetch(`https://archive.org/wayback/available?url=${domain}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`https://api.hackertarget.com/reverseiplookup/?q=${domain}`).then((r) => (r.ok ? r.text() : "")),
      ]);

    const val = <T,>(s: PromiseSettledResult<T>, fb: T): T => (s.status === "fulfilled" ? s.value : fb);

    const http = httpRes.status === "fulfilled" ? httpRes.value : null;
    let html = "";
    const headers: Record<string, string> = {};
    if (http) {
      http.headers.forEach((v, k) => (headers[k] = v));
      try { html = (await http.text()).slice(0, 500_000); } catch { /* ignore */ }
    }

    const tech = new Set<string>();
    for (const [re, name] of TECH_SIGNATURES) if (re.test(html)) tech.add(name);
    if (headers["server"]) tech.add(`Server: ${headers["server"]}`);
    if (headers["x-powered-by"]) tech.add(headers["x-powered-by"]);

    const analyticsIds = [...html.matchAll(/(?:G-[A-Z0-9]{6,}|UA-\d{4,}-\d+)/g)].map((m) => m[0]).slice(0, 5);

    const crt = val(crtRes as PromiseSettledResult<{ name_value?: string }[]>, []);
    const subdomains = [
      ...new Set(
        crt.flatMap((c) => (c.name_value ?? "").split("\n")).filter((s) => s.endsWith(domain) && !s.startsWith("*"))
      ),
    ].slice(0, 100);

    const wayback = val(waybackRes as PromiseSettledResult<{ archived_snapshots?: { closest?: { url?: string; timestamp?: string } } } | null>, null);
    const closest = wayback?.archived_snapshots?.closest;

    const revText = val(revIpRes as PromiseSettledResult<string>, "");
    const reverseIp = revText && !revText.includes("error")
      ? revText.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 50)
      : [];

    const robotsTxt =
      robotsRes.status === "fulfilled" && robotsRes.value.ok
        ? (await robotsRes.value.text()).slice(0, 10_000)
        : null;

    const hasSitemap = await fetch(`https://${domain}/sitemap.xml`, { method: "HEAD", signal: AbortSignal.timeout(4000) })
      .then((r) => r.ok).catch(() => false);

    return {
      domain,
      whois: val(whois, null),
      dns: {
        A: val(a, null), AAAA: val(aaaa, null), MX: val(mx, null),
        TXT: val(txt, null), NS: val(ns, null), CNAME: val(cname, null), SOA: val(soa, null),
      },
      subdomains, ssl: val(ssl, null), headers,
      tech: [...tech], robotsTxt, hasSitemap,
      wayback: { available: !!closest, url: closest?.url, timestamp: closest?.timestamp },
      reverseIp, analyticsIds,
    };
  });

  return NextResponse.json({ success: true, data });
}
