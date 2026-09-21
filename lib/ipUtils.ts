import type { IPLookupResult } from "@/types/ip";

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

const IPV6_REGEX =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}|:):(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?)$/;

export function isValidIPv4(ip: string): boolean {
  return IPV4_REGEX.test(ip);
}

export function isValidIPv6(ip: string): boolean {
  return IPV6_REGEX.test(ip);
}

export function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

const DOMAIN_REGEX =
  /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,11}?$/;

export function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain.trim());
}

export function validateTarget(input: string): {
  valid: boolean;
  type: "ipv4" | "ipv6" | "domain" | null;
  error?: string;
} {
  const value = input.trim();
  if (!value) return { valid: false, type: null, error: "Input kosong." };
  if (isValidIPv4(value)) return { valid: true, type: "ipv4" };
  if (isValidIPv6(value)) return { valid: true, type: "ipv6" };
  if (isValidDomain(value)) return { valid: true, type: "domain" };
  return {
    valid: false,
    type: null,
    error: "Format bukan IPv4, IPv6, atau domain yang valid."
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function flagUrl(countryCode?: string): string | null {
  if (!countryCode) return null;
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

export function formatBool(b?: boolean): string {
  if (b === undefined) return "N/A";
  return b ? "Yes" : "No";
}

export function emptyResult(query: string): IPLookupResult {
  return { query, status: "fail" };
}
