import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The build's base path is set via BASE_PATH. On the deployed Cloudflare Workers
// site the builder is served under /builder/ (BASE_PATH=/builder/); locally
// `base` stays "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
});
