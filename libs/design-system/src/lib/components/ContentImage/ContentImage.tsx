import type { StaticImageData } from "next/image";

/**
 * ContentImage component.
 *
 * Renders images with WebP support for static-export sites.
 * Uses <picture> element with WebP <source> and JPEG/PNG fallback.
 * Designed for use with the `unoptimized: true` Next.js config.
 *
 * If a `.webp` version of the image exists alongside the original,
 * it will be used automatically. Otherwise, falls back to the original format.
 *
 * Supports both string URLs (for static exports) and webpack-imported images.
 */

export interface ContentImageProps {
  src: string | StaticImageData;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

/**
 * Derive the WebP source URL from the original image path.
 * e.g., "/projects/photo.jpeg" -> "/projects/photo.webp"
 */
function getWebpSrc(src: string): string | null {
  const ext = src.substring(src.lastIndexOf("."));
  const base = src.substring(0, src.lastIndexOf("."));
  const webpSrc = `${base}.webp`;

  if ([".jpg", ".jpeg", ".png"].includes(ext.toLowerCase())) {
    return webpSrc;
  }

  // SVG and other formats already have good compression
  return null;
}

/**
 * Check if the src is a webpack-imported image (StaticImageData).
 */
function isStaticImageData(
  src: string | StaticImageData,
): src is StaticImageData {
  return typeof src === "object" && src !== null;
}

export function ContentImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
  loading = "lazy",
}: ContentImageProps) {
  // For webpack-imported images (like profile picture), we can't generate
  // WebP variants since they're bundled by webpack. Use a plain img tag.
  if (isStaticImageData(src)) {
    return (
      <img
        src={src.src}
        alt={alt}
        width={800}
        height={800}
        className={className}
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
      />
    );
  }

  const webpSrc = getWebpSrc(src);

  // For SVG images (already optimized), use a plain img tag
  if (src.endsWith(".svg")) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        sizes={sizes}
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : "auto"}
      />
    );
  }

  // For images with WebP variants, use <picture>
  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" {...(sizes && { sizes })} />
        <img
          src={src}
          alt={alt}
          className={className}
          loading={priority ? "eager" : loading}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          width={800}
          height={600}
        />
      </picture>
    );
  }

  // For other formats (gif, etc.), use plain img
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      loading={priority ? "eager" : loading}
      fetchPriority={priority ? "high" : "auto"}
      width={800}
      height={600}
    />
  );
}
