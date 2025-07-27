import tsParser from "@typescript-eslint/parser";
import checkFilePlugin from "eslint-plugin-check-file";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

// 'import' is ambiguous & prettier has trouble

const myRules = {
  "prefer-arrow-callback": ["error"],
  "prefer-template": ["error"],
  semi: ["error"],
  quotes: ["error", "double"],
  "no-var": ["error"],
  "prefer-const": ["error"],
  "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  "check-file/filename-naming-convention": [
    "error",
    {
      "**/!(_*)*.{ts,tsx}": "KEBAB_CASE",
    },
    {
      ignoreMiddleExtensions: true,
    },
  ],
  "check-file/folder-naming-convention": [
    "error",
    {
      "src/**/!^[.*": "KEBAB_CASE",
    },
  ],
};

// Define our configurations
export default [
  {
    // Global ignores - these files won't be linted at all
    ignores: ["**/*.d.ts", "**/.vinxi/**", "**/.output/**", "db-data/**", ".tanstack/**"],
  },
  {
    rules: myRules,
  },
  // Add specific configurations for route files and $.ts files to disable the naming rule
  {
    files: [
      "**/routes/**/*_.$*.{ts,tsx}",
      "**/routes/**/*.$*.{ts,tsx}",
      "**/$.ts",
      "**/$*.{ts,tsx}", // Added pattern for files starting with $
    ],
    rules: {
      "check-file/filename-naming-convention": "off",
    },
  },
  {
    plugins: {
      react: reactPlugin,
      "check-file": checkFilePlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: "latest",
        project: "./tsconfig.json",
      },
    },
  },
];
