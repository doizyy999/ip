import axios from "axios";
import { IP_API_BASE, IPINFO_BASE } from "@/lib/constants";
import type { IPLookupResult } from "@/types/ip";

export async function fetchIpApi(target: string): Promise<IPLookupResult> {
  const key = process.env.IPAPI_KEY;
  const fields =
    "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting,currency,query";
  const url = `${IP_API_BASE}/${encodeURIComponent(target)}?fields=${fields}${key ? `&key=${key}` : ""}`;
  const { data } = await axios.get(url, { timeout: 8000 });
  if (data.status !== "success") {
    throw new Error(data.message || "ip-api lookup failed");
  }
  return { ...data, source: "ip-api" } as IPLookupResult;
}

export async function fetchIpInfo(target: string): Promise<IPLookupResult> {
  const token = process.env.IPINFO_TOKEN;
  const url = `${IPINFO_BASE}/${encodeURIComponent(target)}/json${token ? `?token=${token}` : ""}`;
  const { data } = await axios.get(url, { timeout: 8000 });
  if (data.bogon) throw new Error("Bogon/private IP");
  const [lat, lon] = (data.loc || ",").split(",").map(Number);
  return {
    query: data.ip || target,
    status: "success",
    country: data.country,
    countryCode: data.country,
    region: data.region,
    regionName: data.region,
    city: data.city,
    zip: data.postal,
    lat: isNaN(lat) ? undefined : lat,
    lon: isNaN(lon) ? undefined : lon,
    timezone: data.timezone,
    isp: data.org,
    org: data.org,
    as: data.org?.startsWith("AS") ? data.org.split(" ")[0] : undefined,
    reverse: data.hostname,
    currency: data.currency,
    source: "ipinfo"
  };
}

export const PROVIDERS = [
  { name: "ip-api" as const, fetcher: fetchIpApi },
  { name: "ipinfo" as const, fetcher: fetchIpInfo }
];
