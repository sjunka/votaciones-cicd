import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**"],
      // Solo se mide la lógica (src/lib). main.jsx y los componentes son
      // puramente visuales y los cubre el E2E de Selenium en staging.
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
