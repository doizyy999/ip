export type SearchType = "username" | "email" | "phone" | "domain";

export interface PlatformHit {
  platform: string;
  category: string;
  url: string;
  status: "found" | "not_found" | "error";
  httpStatus?: number;
  responseMs?: number;
}

export interface EmailIntel {
  email: string;
  valid: boolean;
  domain: string;
  mxRecords: string[];
  disposable: boolean;
  gravatar: {
    exists: boolean;
    profileUrl?: string;
    displayName?: string;
    aboutMe?: string;
    avatarUrl?: string;
    accounts?: { name: string; url: string }[];
  } | null;
  github: { login: string; url: string; avatar: string }[];
  riskScore: number;
  riskFactors: string[];
}

export interface PhoneIntel {
  input: string;
  valid: boolean;
  e164?: string;
  international?: string;
  national?: string;
  country?: string;
  countryCode?: string;
  nationalNumber?: string;
  type?: string;
  whatsappUrl?: string;
  telegramUrl?: string;
  notes: string[];
}

export interface DomainIntel {
  domain: string;
  whois: Record<string, unknown> | null;
  dns: Record<string, unknown>;
  subdomains: string[];
  ssl: { issuer?: string; notBefore?: string; notAfter?: string } | null;
  headers: Record<string, string>;
  tech: string[];
  robotsTxt: string | null;
  hasSitemap: boolean;
  wayback: { available: boolean; url?: string; timestamp?: string };
  reverseIp: string[];
  analyticsIds: string[];
}

export interface ImageIntel {
  exif: Record<string, unknown>;
  gps: { lat: number; lng: number } | null;
  stripped: boolean;
  reverse: { engine: string; url: string }[];
}

export interface SocialProfile {
  platform: string;
  found: boolean;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
  joinedAt?: string;
  lastActivity?: string;
  url?: string;
  extra?: Record<string, unknown>;
  fakeSignals?: string[];
}

export interface TimelineEvent {
  date: string;
  category: string;
  title: string;
  source: string;
  url?: string;
}

export interface GraphData {
  nodes: { id: string; label: string; group: string }[];
  links: { source: string; target: string; label?: string }[];
}

export interface PublicRecord {
  source: string;
  title: string;
  url: string;
  summary?: string;
  date?: string;
}
