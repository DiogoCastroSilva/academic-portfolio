/**
 * @vitest-environment happy-dom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { StaticImageData } from "next/image";

import { ContentImage } from "./ContentImage";

describe("ContentImage", () => {
  afterEach(() => {
    cleanup();
  });

  describe("WebP with <picture> element", () => {
    it("renders <picture> with WebP source and JPEG fallback", () => {
      render(<ContentImage src="/projects/photo.jpg" alt="Project photo" />);

      const picture = screen.getByRole("img").closest("picture");
      expect(picture).toBeInTheDocument();

      const source = picture?.querySelector("source");
      expect(source).toHaveAttribute("type", "image/webp");
      expect(source).toHaveAttribute("srcset", "/projects/photo.webp");

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/projects/photo.jpg");
      expect(img).toHaveAttribute("alt", "Project photo");
    });

    it("renders <picture> with PNG fallback", () => {
      render(<ContentImage src="/projects/photo.png" alt="Project photo" />);

      const picture = screen.getByRole("img").closest("picture");
      expect(picture).toBeInTheDocument();

      const source = picture?.querySelector("source");
      expect(source).toHaveAttribute("type", "image/webp");
      expect(source).toHaveAttribute("srcset", "/projects/photo.webp");

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/projects/photo.png");
    });

    it("handles JPEG extension case insensitively", () => {
      render(<ContentImage src="/projects/photo.JPEG" alt="Project photo" />);

      const picture = screen.getByRole("img").closest("picture");
      expect(picture).toBeInTheDocument();

      const source = picture?.querySelector("source");
      expect(source).toHaveAttribute("type", "image/webp");
      expect(source).toHaveAttribute("srcset", "/projects/photo.webp");
    });
  });

  describe("SVG images", () => {
    it("renders plain <img> for SVG without <picture>", () => {
      render(<ContentImage src="/icons/logo.svg" alt="Logo" />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/icons/logo.svg");
      expect(img).toHaveAttribute("alt", "Logo");
      expect(img.closest("picture")).toBeNull();
    });
  });

  describe("other formats", () => {
    it("renders plain <img> for GIF without <picture>", () => {
      render(<ContentImage src="/animations/demo.gif" alt="Demo animation" />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/animations/demo.gif");
      expect(img).toHaveAttribute("alt", "Demo animation");
      expect(img.closest("picture")).toBeNull();
    });
  });

  describe("StaticImageData (webpack imported)", () => {
    it("renders plain <img> without <picture> for StaticImageData", () => {
      const staticImage: StaticImageData = {
        src: "/images/profile.jpeg",
        height: 200,
        width: 200,
        blurDataURL: "",
        blurWidth: 0,
        blurHeight: 0,
      };

      render(<ContentImage src={staticImage} alt="Profile" />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/images/profile.jpeg");
      expect(img).toHaveAttribute("alt", "Profile");
      expect(img.closest("picture")).toBeNull();
    });
  });

  describe("accessibility", () => {
    it("always sets the alt attribute", () => {
      render(
        <ContentImage src="/projects/photo.jpg" alt="Important project" />,
      );
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "Important project");
    });

    it("handles empty alt for decorative images", () => {
      render(<ContentImage src="/projects/photo.jpg" alt="" />);
      const img = screen.getByRole("presentation");
      expect(img).toHaveAttribute("alt", "");
    });
  });

  describe("loading and priority attributes", () => {
    it("defaults to lazy loading", () => {
      render(<ContentImage src="/projects/photo.jpg" alt="Photo" />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("loading", "lazy");
    });

    it("uses eager loading when priority is true", () => {
      render(<ContentImage src="/projects/photo.jpg" alt="Photo" priority />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("loading", "eager");
    });

    it("respects custom loading attribute", () => {
      render(
        <ContentImage src="/projects/photo.jpg" alt="Photo" loading="eager" />,
      );
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("loading", "eager");
    });
  });

  describe("sizes attribute", () => {
    it("passes sizes to <source> in <picture>", () => {
      render(
        <ContentImage
          src="/projects/photo.jpg"
          alt="Photo"
          sizes="(max-width: 768px) 100vw, 50vw"
        />,
      );

      const picture = screen.getByRole("img").closest("picture");
      const source = picture?.querySelector("source");
      expect(source).toHaveAttribute("sizes", "(max-width: 768px) 100vw, 50vw");

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("sizes", "(max-width: 768px) 100vw, 50vw");
    });

    it("does not pass sizes when not provided for plain <img>", () => {
      render(<ContentImage src="/icons/logo.svg" alt="Logo" />);
      const img = screen.getByRole("img");
      expect(img).not.toHaveAttribute("sizes");
    });
  });

  describe("className", () => {
    it("applies className to <img>", () => {
      render(
        <ContentImage
          src="/projects/photo.jpg"
          alt="Photo"
          className="rounded-lg shadow-md"
        />,
      );
      const img = screen.getByRole("img");
      expect(img).toHaveClass("rounded-lg", "shadow-md");
    });
  });
});
