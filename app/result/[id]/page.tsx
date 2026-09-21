"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { loadResult } from "@/lib/store";
import type { SearchResult } from "@/lib/orchestrator";
import type {
  EmailIntel, PhoneIntel, DomainIntel, PlatformHit, SocialProfile,
  PublicRecord, TimelineEvent, GraphData,
} from "@/types";
import { ResultTabs, TabsContent } from "@/components/ResultTabs";
import { ProfileCard, CopyField } from "@/components/ProfileCard";
import { TimelineView } from "@/components/TimelineView";
import { RelationshipGraph } from "@/components/RelationshipGraph";
import { MapView } from "@/components/MapView";
import { ExportButton } from "@/components/ExportButton";
import { AiAnalyzeButton } from "@/components/ai/AiAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { riskColor } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16: params async — unwrap dengan React.use()
  const { id } = use(params);
  const [result, setResult] = useState<SearchResult | null | undefined>(undefined);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setResult(loadResult<SearchResult>(id));
  }, [id]);

  if (result === undefined) {
    return (
      <div className="space-y-4 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Hasil tidak ditemukan (sessionStorage habis / sesi baru).</p>
        <Link href="/" className="mt-2 inline-block text-cyber-cyan underline">
          Scan ulang
        </Link>
      </div>
    );
  }

  const usernameData = result.modules.username?.data as
    | { username: string; foundCount: number; total: number; results: PlatformHit[] }
    | undefined;
  const emailData = result.modules.email?.data as EmailIntel | undefined;
  const phoneData = result.modules.phone?.data as PhoneIntel | undefined;
  const domainData = result.modules.domain?.data as DomainIntel | undefined;
  const socialData = result.modules.social?.data as
    | { username: string; profiles: SocialProfile[]; foundCount: number }
    | undefined;
  const recordsData = result.modules["public-records"]?.data as
    | { query: string; records: PublicRecord[] }
    | undefined;

  // Timeline events dari semua modul
  const events: TimelineEvent[] = [];
  if (emailData?.gravatar?.exists)
    events.push({ date: result.createdAt, category: "platform", title: "Gravatar publik aktif", source: "email", url: emailData.gravatar.profileUrl });
  for (const gh of emailData?.github ?? [])
    events.push({ date: result.createdAt, category: "platform", title: `GitHub account: ${gh.login}`, source: "email", url: gh.url });
  for (const p of socialData?.profiles ?? []) {
    if (p.found && p.joinedAt)
      events.push({ date: p.joinedAt, category: "platform", title: `Join ${p.platform}`, source: "social", url: p.url });
    if (p.found && p.lastActivity)
      events.push({ date: p.lastActivity, category: "post", title: `Aktivitas terakhir ${p.platform}`, source: "social", url: p.url });
  }
  for (const r of recordsData?.records ?? []) {
    if (r.date) events.push({ date: r.date, category: r.source === "Google News" ? "news" : "legal", title: r.title, source: r.source, url: r.url });
  }
  if (domainData?.wayback?.available && domainData.wayback.timestamp) {
    const ts = domainData.wayback.timestamp;
    events.push({ date: `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`, category: "other", title: "Snapshot Wayback Machine pertama terdekat", source: "domain", url: domainData.wayback.url });
  }

  // Graph nodes/links
  const graph: GraphData = { nodes: [], links: [] };
  const addNode = (nid: string, label: string, group: string) => {
    if (!graph.nodes.some((n) => n.id === nid)) graph.nodes.push({ id: nid, label, group });
  };
  for (const h of usernameData?.results ?? []) {
    if (h.status !== "found") continue;
    addNode(h.platform, h.platform, "account");
    graph.links.push({ source: "root", target: h.platform, label: h.category });
  }
  for (const p of socialData?.profiles ?? []) {
    if (!p.found) continue;
    addNode(`soc-${p.platform}`, p.platform, "account");
    graph.links.push({ source: "root", target: `soc-${p.platform}` });
    if (p.extra?.company) {
      const org = String(p.extra.company);
      addNode(`org-${org}`, org, "org");
      graph.links.push({ source: `soc-${p.platform}`, target: `org-${org}` });
    }
    if (p.extra?.location) {
      const loc = String(p.extra.location);
      addNode(`loc-${loc}`, loc, "location");
      graph.links.push({ source: `soc-${p.platform}`, target: `loc-${loc}` });
    }
  }
  if (domainData) {
    addNode("domain", domainData.domain, "domain");
    graph.links.push({ source: "root", target: "domain" });
  }
  // Graph butuh root node
  const graphWithRoot: GraphData = {
    nodes: [{ id: "root", label: result.query, group: "target" }, ...graph.nodes],
    links: graph.links,
  };

  const hits = (usernameData?.results ?? []).filter((h) => {
    if (statusFilter !== "all" && h.status !== statusFilter) return false;
    if (filter && !h.platform.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-widest text-cyber-cyan">
            {result.query}
          </h1>
          <p className="text-xs text-zinc-500">
            type: {result.type} · {new Date(result.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <ExportButton data={result} filename={`trace-${result.query}`} />
      </div>

      <ResultTabs>
        <TabsContent value="profile" className="space-y-6">
          {emailData && (
            <div className="space-y-3">
              <ProfileCard
                title="Email Intelligence"
                risk={emailData.riskScore}
                fields={[
                  { label: "Email", value: emailData.email },
                  { label: "Domain", value: emailData.domain },
                  { label: "MX Records", value: emailData.mxRecords.join(", ") || "-" },
                  { label: "Disposable", value: emailData.disposable ? "YA ⚠️" : "Tidak" },
                  { label: "Gravatar", value: emailData.gravatar?.exists ? emailData.gravatar.displayName ?? "Aktif" : "Tidak ada" },
                ]}
                links={emailData.github.map((g) => ({ label: `GitHub: ${g.login}`, url: g.url }))}
              />
              {emailData.riskFactors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emailData.riskFactors.map((r) => (
                    <Badge key={r} variant="amber">{r}</Badge>
                  ))}
                </div>
              )}
              <AiAnalyzeButton type="profile" data={emailData} />
            </div>
          )}

          {phoneData && (
            <div className="space-y-3">
              <ProfileCard
                title="Phone Intelligence"
                fields={[
                  { label: "E.164", value: phoneData.e164 },
                  { label: "Internasional", value: phoneData.international },
                  { label: "Nasional", value: phoneData.national },
                  { label: "Negara", value: phoneData.country },
                  { label: "Calling Code", value: phoneData.countryCode },
                  { label: "Tipe", value: phoneData.type },
                ]}
                links={[
                  ...(phoneData.whatsappUrl ? [{ label: "Cek WhatsApp", url: phoneData.whatsappUrl }] : []),
                  ...(phoneData.telegramUrl ? [{ label: "Cek Telegram", url: phoneData.telegramUrl }] : []),
                ]}
              />
              <AiAnalyzeButton type="profile" data={phoneData} />
            </div>
          )}

          {domainData && (
            <div className="space-y-3">
              <ProfileCard
                title="Domain & Website"
                fields={[
                  { label: "Domain", value: domainData.domain },
                  { label: "Registrar", value: String(domainData.whois?.registrar ?? "-") },
                  { label: "Dibuat", value: String(domainData.whois?.createdDate ?? "-") },
                  { label: "Expiry", value: String(domainData.whois?.expiryDate ?? "-") },
                  { label: "SSL Issuer", value: domainData.ssl?.issuer ?? "-" },
                  { label: "SSL Valid To", value: domainData.ssl?.notAfter ?? "-" },
                  { label: "Analytics IDs", value: domainData.analyticsIds.join(", ") || "-" },
                  { label: "Subdomains", value: domainData.subdomains.length },
                ]}
                links={[
                  ...(domainData.wayback.url ? [{ label: "Wayback Machine", url: domainData.wayback.url }] : []),
                ]}
              />
              {domainData.tech.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {domainData.tech.map((t) => (
                    <Badge key={t} variant="cyan">{t}</Badge>
                  ))}
                </div>
              )}
              {domainData.subdomains.length > 0 && (
                <Card className="border-zinc-800 bg-zinc-900/60">
                  <CardHeader><CardTitle className="text-sm">Subdomains (crt.sh)</CardTitle></CardHeader>
                  <CardContent className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                    {domainData.subdomains.map((s) => (
                      <p key={s} className="font-mono text-xs text-zinc-400">{s}</p>
                    ))}
                  </CardContent>
                </Card>
              )}
              <AiAnalyzeButton type="profile" data={domainData} />
            </div>
          )}

          {socialData && (
            <div className="space-y-3">
              <h3 className="font-mono text-sm tracking-widest text-zinc-500">
                SOCIAL PROFILES ({socialData.foundCount} found)
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {socialData.profiles.filter((p) => p.found).map((p) => (
                  <Card key={p.platform} className="border-zinc-800 bg-zinc-900/60">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      {p.avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatar} alt="" className="h-8 w-8 rounded-full" />
                      )}
                      <CardTitle className="text-sm">{p.platform}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs text-zinc-400">
                      {p.name && <p className="text-zinc-200">{p.name}</p>}
                      {p.bio && <p className="line-clamp-2">{p.bio}</p>}
                      {p.followers !== undefined && <p>followers: {p.followers} · following: {p.following}</p>}
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyber-cyan hover:underline">
                          <ExternalLink className="h-3 w-3" /> profil
                        </a>
                      )}
                      {p.fakeSignals && p.fakeSignals.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.fakeSignals.map((s) => (
                            <Badge key={s} variant="amber">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <AiAnalyzeButton type="profile" data={socialData} />
            </div>
          )}

          {usernameData && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-sm tracking-widest text-zinc-500">
                  USERNAME SCAN — {usernameData.foundCount}/{usernameData.total} found
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="filter platform..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-8 w-44 text-xs"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs"
                  >
                    <option value="all">all</option>
                    <option value="found">found</option>
                    <option value="not_found">not_found</option>
                    <option value="error">error</option>
                  </select>
                  <ExportButton data={hits} filename={`trace-username-${usernameData.username}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {hits.map((h) => (
                  <a
                    key={h.platform}
                    href={h.status === "found" ? h.url : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                      h.status === "found"
                        ? "border-cyber-cyan/40 bg-cyber-cyan/5 text-zinc-100 hover:border-cyber-cyan"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-500"
                    }`}
                  >
                    <span>{h.platform}</span>
                    <Badge
                      variant={h.status === "found" ? "green" : h.status === "error" ? "amber" : "default"}
                    >
                      {h.status}
                    </Badge>
                  </a>
                ))}
              </div>
              <AiAnalyzeButton type="profile" data={{ username: usernameData.username, found: usernameData.results.filter((r) => r.status === "found") }} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView events={events} />
          <div className="mt-4">
            <AiAnalyzeButton type="timeline" data={events} />
          </div>
        </TabsContent>

        <TabsContent value="graph">
          {graphWithRoot.nodes.length > 1 ? (
            <>
              <RelationshipGraph data={graphWithRoot} />
              <div className="mt-4">
                <AiAnalyzeButton type="graph" data={graphWithRoot} />
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Belum cukup data untuk graph. Jalankan scan username.</p>
          )}
        </TabsContent>

        <TabsContent value="map">
          <p className="text-sm text-zinc-500">
            Peta tampil otomatis dari modul Image (EXIF GPS) atau lokasi profil sosial.
            Gunakan endpoint <code className="rounded bg-zinc-800 px-1">/api/image</code> untuk upload gambar.
          </p>
          <div className="mt-4">
            <MapView lat={-6.2} lng={106.816} label="Default: Jakarta" />
          </div>
        </TabsContent>

        <TabsContent value="records">
          {recordsData ? (
            <div className="space-y-2">
              {recordsData.records.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition hover:border-cyber-cyan/50"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">{r.source}</Badge>
                    {r.date && <span className="text-xs text-zinc-500">{r.date}</span>}
                  </div>
                  <p className="mt-1 text-sm text-zinc-200">{r.title}</p>
                  {r.summary && <p className="text-xs text-zinc-500">{r.summary}</p>}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Tidak ada data records.</p>
          )}
        </TabsContent>

        <TabsContent value="ai">
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              Chat AI dengan konteks hasil scan ini otomatis terlampir.
            </p>
            <Link
              href="/ai"
              className="inline-block rounded-md bg-cyber-cyan px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyber-cyan/80"
            >
              Buka AI Assistant →
            </Link>
            <AiAnalyzeButton type="profile" data={result} />
          </div>
        </TabsContent>
      </ResultTabs>

      {Object.values(result.modules).some((m) => !m.success) && (
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader><CardTitle className="text-xs text-zinc-500">Module errors</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs text-zinc-500">
            {Object.entries(result.modules)
              .filter(([, m]) => !m.success)
              .map(([name, m]) => (
                <p key={name}>
                  <span className="font-mono text-amber-400">{name}</span>: {m.error ?? "failed"} ({m.durationMs}ms)
                </p>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
