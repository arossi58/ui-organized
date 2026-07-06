import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Mirrors the other apps: `base` honours BASE_PATH for GitHub Pages builds.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
});
