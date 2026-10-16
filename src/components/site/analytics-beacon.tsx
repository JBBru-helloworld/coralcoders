/*
 * Cloudflare Web Analytics (cookieless), manual snippet setup. Rendered only
 * when NEXT_PUBLIC_CF_BEACON_TOKEN is set at build time, so local and preview
 * builds send nothing. A deferred external script at the end of <body>: it
 * runs after parsing, renders nothing, and so cannot affect LCP or CLS.
 */
const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim();

export function AnalyticsBeacon() {
  if (!token) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
