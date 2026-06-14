import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the app is served from https://<user>.github.io/<repo>/,
// so the build needs a matching base path. Locally `base` stays "/".
// React Router reads the same value via import.meta.env.BASE_URL.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
});
