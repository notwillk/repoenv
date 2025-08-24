// eslint.config.js
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Ignore junk + don't lint the linter 🙂
  { ignores: ["dist", "node_modules", "eslint.config.js"] },

  // Ensure JS files use the default JS parser (not TS)
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },

  // Base TS rules (NON type-aware)
  ...tseslint.configs.recommended,

  // Your TS + Prettier setup, scoped to TS only
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        // no `project` => no typed rules => no complaints
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Turn off stylistic conflicts + run Prettier
  prettierRecommended,
];