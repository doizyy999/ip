import type { ParsedUserAgent } from "@/types/ip";

export function parseUserAgent(ua: string): ParsedUserAgent {
  if (!ua) {
    return { browser: "Unknown", browserVersion: "", os: "Unknown", device: "Unknown" };
  }

  const result: ParsedUserAgent = {
    browser: "Unknown",
    browserVersion: "",
    os: "Unknown",
    device: "Unknown"
  };

  // Bots
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    result.device = "Bot";
    result.browser = "Bot";
    return result;
  }

  // Browser
  const browserRules: [RegExp, string][] = [
    [/Edg(?:e|A|iOS)?\/(\d+[\d.]*)/, "Edge"],
    [/OPR\/(\d+[\d.]*)/, "Opera"],
    [/Chrome\/(\d+[\d.]*)/, "Chrome"],
    [/Firefox\/(\d+[\d.]*)/, "Firefox"],
    [/Version\/(\d+[\d.]*).*Safari/, "Safari"],
    [/Safari\/(\d+[\d.]*)/, "Safari"],
    [/MSIE (\d+[\d.]*)/, "Internet Explorer"],
    [/Trident.*rv:(\d+[\d.]*)/, "Internet Explorer"]
  ];
  for (const [regex, name] of browserRules) {
    const m = ua.match(regex);
    if (m) {
      result.browser = name;
      result.browserVersion = m[1];
      break;
    }
  }

  // OS
  const osRules: [RegExp, string][] = [
    [/Windows NT 10\.0/, "Windows 10/11"],
    [/Windows NT 6\.3/, "Windows 8.1"],
    [/Windows NT 6\.2/, "Windows 8"],
    [/Windows NT 6\.1/, "Windows 7"],
    [/Android ([\d.]+)/, "Android"],
    [/iPhone OS ([\d_]+)/, "iOS"],
    [/iPad.*OS ([\d_]+)/, "iPadOS"],
    [/Mac OS X ([\d_]+)/, "macOS"],
    [/CrOS/, "ChromeOS"],
    [/Linux/, "Linux"]
  ];
  for (const [regex, name] of osRules) {
    const m = ua.match(regex);
    if (m) {
      result.os = m[1] ? `${name} ${m[1].replace(/_/g, ".")}` : name;
      break;
    }
  }

  // Device type
  if (/iPad|Tablet/i.test(ua)) result.device = "Tablet";
  else if (/Mobile|iPhone|Android.*Mobile|Windows Phone/i.test(ua)) result.device = "Mobile";
  else if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) result.device = "Desktop";

  return result;
}
