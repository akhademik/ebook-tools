import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        pdfjsLib: "readonly",
        JSZip: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "vars": "all", "args": "none" }],
      "no-constant-condition": "off",
      "no-empty": "warn",
      "no-undef": "error",
      "no-control-regex": "off"
    }
  }
];
