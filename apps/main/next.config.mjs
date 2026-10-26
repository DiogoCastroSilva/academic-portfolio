import { fileURLToPath } from "node:url";
import path from "node:path";

import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import { composePlugins, withNx } from "@nx/next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPrefix = basePath ? `${basePath.replace(/\/+$/, "")}/` : "";

/**
 * @param {string} phase
 * @returns {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const createNextConfig = (phase) => ({
  output: "export", // For GitHub Pages
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : "../../public",
  basePath,
  assetPrefix,
  transpilePackages: [
    "@academic-portfolio/content",
    "@academic-portfolio/projects",
    "@academic-portfolio/publications",
    "@academic-portfolio/blog",
    "@academic-portfolio/navigation",
    "@academic-portfolio/design-system",
  ],
  pageExtensions: ["ts", "tsx", "md"],
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  trailingSlash: true, // Helps with GitHub Pages routing
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
});

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

/**
 * @param {string} phase
 * @param {object} context
 */
const createConfig = async (phase, context) =>
  composePlugins(...plugins)(createNextConfig(phase))(phase, context);

export default createConfig;
