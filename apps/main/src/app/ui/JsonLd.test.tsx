/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "./JsonLd.js";

describe("JsonLd", () => {
  it("renders a script tag with type application/ld+json", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Test",
    };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector(
      "script[type='application/ld+json']",
    );
    expect(script).toBeInTheDocument();
  });

  it("embeds the data object as JSON string", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Alice",
    };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector(
      "script[type='application/ld+json']",
    );
    const parsed = JSON.parse(script!.innerHTML);

    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Alice");
  });

  it("preserves nested objects and arrays in the JSON output", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Test Site",
      sameAs: ["https://example.com", "https://twitter.com/example"],
      author: { "@type": "Person", name: "Bob" },
    };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector(
      "script[type='application/ld+json']",
    );
    const parsed = JSON.parse(script!.innerHTML);

    expect(parsed.sameAs).toHaveLength(2);
    expect(parsed.author.name).toBe("Bob");
  });

  it("converts undefined values to null (valid JSON)", () => {
    const data = { "@type": "Person", name: "Test", missing: undefined };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector(
      "script[type='application/ld+json']",
    );
    // JSON.parse should succeed — undefined must not appear in serialized JSON
    expect(() => JSON.parse(script!.innerHTML)).not.toThrow();

    const parsed = JSON.parse(script!.innerHTML);
    expect(parsed.missing).toBeNull();
  });
});
