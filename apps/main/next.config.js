//@ts-check

const path = require('path');
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const { composePlugins, withNx } = require('@nx/next');

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const assetPrefix = basePath ? `${basePath.replace(/\/$/, '')}/` : '';

/**
 * @param {string} phase
 * @returns {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const createNextConfig = (phase) => ({
  output: 'export', // For GitHub Pages
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next' : '../../public',
  basePath,
  assetPrefix,
  transpilePackages: [
    '@katie-portofolio/content',
    '@katie-portofolio/projects',
    '@katie-portofolio/publications',
    '@katie-portofolio/navigation',
  ],
  pageExtensions: ['ts', 'tsx', 'md'],
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  trailingSlash: true, // 👈 optional but helps with GitHub Pages routing
  turbopack: {
    root: path.join(__dirname, '../..'),
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
module.exports = async (phase, context) =>
  composePlugins(...plugins)(createNextConfig(phase))(phase, context);
