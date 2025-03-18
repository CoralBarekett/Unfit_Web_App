import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    // Add proxy configuration for API requests
    proxy: {
      "/auth": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://node01.cs.colman.ac.il:3001"  // Use your production server's address
            : "http://localhost:3001",  // Use localhost for development
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://node01.cs.colman.ac.il:3001"  // Production server URL
            : "http://localhost:3001",  // Local development
        changeOrigin: true,
        secure: false,
      },
      "/posts": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://node01.cs.colman.ac.il:3001"  // Adjust for production
            : "http://localhost:3001",  // Local for development
        changeOrigin: true,
        secure: false,
      },
      "/comments": {
        target:
          process.env.NODE_ENV === "production"
            ? "http://node01.cs.colman.ac.il:3001"  // Use your actual server in production
            : "http://localhost:3001",  // Local development
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
