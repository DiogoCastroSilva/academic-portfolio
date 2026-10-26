import baseConfig from "../../eslint.config.mjs";

const config = [
  ...baseConfig,
  {
    ignores: ["**/out-tsc"],
  },
];

export default config;
