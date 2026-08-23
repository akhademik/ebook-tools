import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },

      // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
      // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
      // See https://svelte.dev/docs/kit/adapters for more information about adapters.
      adapter: adapter(),
    }),
  ],
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests-e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.js", "src/**/*.ts"],
      exclude: ["src/**/*.test.js", "src/**/*.spec.js"],
    },
  },
  server: {
    host: "0.0.0.0", // hoặc host: true
    port: 5173,
  },
});
