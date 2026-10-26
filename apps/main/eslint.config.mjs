import baseConfig from "../../eslint.config.mjs";

const config = [
  ...baseConfig,
  {
    ignores: [".next/**", "**/out-tsc"],
  },
];

export default config;
