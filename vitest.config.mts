import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      // Next.js resolves "server-only" to a no-op under its own bundler's
      // "react-server" export condition; outside Next's bundler (here,
      // under Vitest) it resolves to a stub that unconditionally throws,
      // since its whole purpose is to break client bundles that
      // accidentally pull in server-only code. Point it at the package's
      // own intended no-op instead of chasing Vite's `resolve.conditions`,
      // which would also affect every other conditional-exports package.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
});
