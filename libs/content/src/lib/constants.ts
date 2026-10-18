export const DEPLOYMENT_PLACEHOLDER = "DEPLOYMENT_URL";

function normalizeBasePath(basePath?: string): string {
  if (!basePath?.trim() || basePath === "/") {
    return "";
  }

  return `/${basePath.trim().replace(/^\/+|\/+$/g, "")}`;
}

export function getPublicBasePath(): string {
  return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
}

export function withPublicBasePath(publicPath: string): string {
  if (!publicPath.startsWith("/")) {
    return publicPath;
  }

  return `${getPublicBasePath()}${publicPath}`;
}

export function getDeploymentUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_DEPLOYMENT_URL ||
    (process.env.NEXT_PUBLIC_SITE_URL as string | undefined) ||
    (process.env.NEXT_PUBLIC_VERCEL_URL as string | undefined) ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ||
    undefined
  );
}

/**
 * Build an absolute canonical URL from a base-path-free path.
 *
 * Use this for page URLs like `/projects/my-project`.
 * Use `getFullAssetUrl` for asset paths that already include the base path.
 *
 * Returns `undefined` when no deployment URL is configured.
 */
export function getFullUrl(path: string): string | undefined {
  const url = getDeploymentUrl();
  if (!url) return undefined;
  return `${url}${path}`;
}

/**
 * Build an absolute URL for a public asset path.
 *
 * The `publicPath` argument should already include the base path
 * (e.g. via `withPublicBasePath()`), so we strip the base path before
 * concatenating with the deployment URL to avoid duplicating it.
 *
 * Returns `undefined` when no deployment URL is configured.
 */
export function getFullAssetUrl(publicPath: string): string | undefined {
  const url = getDeploymentUrl();
  if (!url) return undefined;

  const basePath = getPublicBasePath();
  const path =
    basePath && publicPath.startsWith(basePath)
      ? publicPath.slice(basePath.length)
      : publicPath;

  return `${url}${path}`;
}
