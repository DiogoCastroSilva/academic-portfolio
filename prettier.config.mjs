import prettierConfig from "@diogozx-org/prettier-config";

/** @type {import('prettier').Config} */
export default {
  ...prettierConfig,
  // Tailwind CSS class sorting — kept because the project uses Tailwind CSS v4.
  // The shared config does not bundle this plugin so it is added here.
  plugins: ["prettier-plugin-tailwindcss"],
};
