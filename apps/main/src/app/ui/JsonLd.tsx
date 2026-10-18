import type { ReactNode } from "react";

/**
 * Renders a JSON-LD `<script type="application/ld+json">` tag.
 *
 * This component is intentionally free of a `use client` directive so it can
 * be used in both server and client component trees. The JSON-LD data is
 * serialized at build time for static export, so no client-side work is needed.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
interface JsonLdProps {
  /** The JSON-LD data object to inject. */
  data: unknown;
}

export function JsonLd({ data }: JsonLdProps): ReactNode {
  const json = JSON.stringify(data, (_key, value) =>
    value === undefined ? null : value,
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
