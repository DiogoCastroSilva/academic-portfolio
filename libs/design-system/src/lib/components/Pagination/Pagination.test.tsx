/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./Pagination.js";

describe("Pagination", () => {
  const baseUrl = "/blog";

  it("renders nothing when totalPages is 1 (single page)", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} baseUrl={baseUrl} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} baseUrl={baseUrl} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders pagination nav when totalPages > 1", () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl={baseUrl} />);
    expect(
      screen.getByRole("navigation", { name: /pagination/i }),
    ).toBeInTheDocument();
  });

  it("marks current page with aria-current", () => {
    render(<Pagination currentPage={2} totalPages={3} baseUrl={baseUrl} />);
    const current = screen.getByLabelText("Page 2 of 3");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("renders Previous link on non-first page", () => {
    render(<Pagination currentPage={2} totalPages={3} baseUrl={baseUrl} />);
    const prevLink = screen.getByLabelText("Previous page");
    // Page 1 uses clean URL without ?page=1
    expect(prevLink).toHaveAttribute("href", "/blog/");
  });

  it("does not render Previous link on first page", () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl={baseUrl} />);
    expect(screen.queryByLabelText("Previous page")).toBeNull();
  });

  it("renders Next link on non-last page", () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl={baseUrl} />);
    const nextLink = screen.getByLabelText("Next page");
    expect(nextLink).toHaveAttribute("href", "/blog/page/2/");
  });

  it("does not render Next link on last page", () => {
    render(<Pagination currentPage={3} totalPages={3} baseUrl={baseUrl} />);
    expect(screen.queryByLabelText("Next page")).toBeNull();
  });

  it("page 1 uses clean URL without ?page=1", () => {
    render(<Pagination currentPage={2} totalPages={3} baseUrl={baseUrl} />);
    const page1Link = screen.getByLabelText("Go to page 1");
    expect(page1Link).toHaveAttribute("href", "/blog/");
  });

  it("other pages use /page/N URL format", () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl={baseUrl} />);
    const page2Link = screen.getByLabelText("Go to page 2");
    expect(page2Link).toHaveAttribute("href", "/blog/page/2/");
  });

  it("renders all page numbers when totalPages <= 5", () => {
    render(<Pagination currentPage={3} totalPages={3} baseUrl={baseUrl} />);
    // Page 1 is a link (not current)
    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    // Page 2 is a link (not current)
    expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
    // Page 3 is current → rendered as a span with aria-current
    expect(screen.getByLabelText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.queryByText("…")).toBeNull();
  });

  it("shows ellipsis and first/last page for many pages", () => {
    render(<Pagination currentPage={5} totalPages={10} baseUrl={baseUrl} />);
    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 10")).toBeInTheDocument();
    // Two ellipsis characters (before and after the window).
    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("current page is not a link", () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl={baseUrl} />);
    const current = screen.getByLabelText("Page 1 of 3");
    expect(current.tagName).toBe("SPAN");
    expect(current).not.toHaveAttribute("href");
  });

  it("Previous/Next links have descriptive aria-labels", () => {
    render(<Pagination currentPage={2} totalPages={3} baseUrl={baseUrl} />);
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });
});
