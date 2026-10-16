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
