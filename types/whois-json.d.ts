declare module "whois-json" {
  export interface WhoisJsonOptions {
    timeout?: number;
    follow?: number;
    server?: string;
    verbose?: boolean;
  }

  export default function whois(
    domain: string,
    options?: WhoisJsonOptions
  ): Promise<Record<string, unknown>>;
}
