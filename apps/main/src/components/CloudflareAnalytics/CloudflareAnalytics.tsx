import Script from "next/script";
import { siteConfig } from "../../configs/site-config";

const CLOUDFLARE_BEACON_SRC =
  "https://static.cloudflareinsights.com/beacon.min.js";

function isValidCloudflareToken(token: string): boolean {
  return /^[a-f0-9]{32}$/i.test(token);
}

export function CloudflareAnalytics() {
  const { enabled, token } = siteConfig.analytics.cloudflare;

  if (!enabled || !isValidCloudflareToken(token)) {
    return null;
  }

  return (
    <Script
      id="cloudflare-web-analytics"
      src={CLOUDFLARE_BEACON_SRC}
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
