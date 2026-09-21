export interface IPLookupResult {
  query: string;
  status: "success" | "fail";
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  currency?: string;
  source?: "ip-api" | "ipinfo";
}

export interface CompareResult {
  results: [IPLookupResult, IPLookupResult];
  diff: {
    country: boolean;
    isp: boolean;
    city: boolean;
    hosting: boolean;
    proxy: boolean;
    mobile: boolean;
  };
}

export interface MyIPResponse {
  ip: string;
  userAgent: string;
  headers: Record<string, string>;
}

export interface ParsedUserAgent {
  browser: string;
  browserVersion: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown";
}

export interface HistoryItem {
  query: string;
  result: IPLookupResult;
  timestamp: number;
}
