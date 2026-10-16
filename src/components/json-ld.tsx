import type { JsonLdNode } from "@/lib/schema";

/**
 * Renders schema.org data. `<` is escaped so a string value can never close
 * the script tag early.
 */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const graph = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
