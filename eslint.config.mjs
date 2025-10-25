import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ),
  {
    ignores: [
      "node_modules/**",
      "node_modules.nosync/**", // ADD THIS
      ".next/**",
      ".next.nosync/**", // ADD THIS
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "resource toolkits/**",
      "newsletter-workspace/**",
      "toolkit-integration/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        },
      ],
      "import/no-unresolved": "off", // TypeScript handles this
    },
  },
];

export default eslintConfig;
