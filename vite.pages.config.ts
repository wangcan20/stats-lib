import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(import.meta.dirname, "github-pages"),
  base: "/stats-lib/",
  publicDir: resolve(import.meta.dirname, "public"),
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, "dist-pages"),
    emptyOutDir: true,
  },
});
