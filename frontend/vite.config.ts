import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    // Add proxy configuration for API requests
    proxy: {
      "/auth": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://127.0.0.1:3001"
            : "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://127.0.0.1:3001"
            : "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/posts": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://127.0.0.1:3001"
            : "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/comments": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://127.0.0.1:3001"
            : "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
