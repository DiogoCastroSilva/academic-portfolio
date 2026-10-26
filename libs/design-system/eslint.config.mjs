import baseConfig from "../../eslint.config.mjs";

const config = [
  ...baseConfig,
  {
    ignores: ["**/out-tsc/**", "**/dist/**"],
  },
];

export default config;
