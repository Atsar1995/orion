import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "lib/providers/**/*.ts",
        "lib/intelligence/alerts/**/*.ts",
        "lib/intelligence/brief/**/*.ts",
        "lib/intelligence/recommendations/**/*.ts",
        "lib/intelligence/ExecutiveIntelligenceService.ts",
        "lib/orchestrator/**/*.ts",
        "components/dashboard/**/*.tsx",
      ],
      exclude: [
        "lib/intelligence/**/index.ts",
        "**/*.test.{ts,tsx}",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
