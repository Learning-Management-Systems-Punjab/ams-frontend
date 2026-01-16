import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for Vercel deployment
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,

    // Enable source maps for debugging (optional, can disable for faster builds)
    sourcemap: false,

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Optimize rollup options
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore TypeScript and unused import warnings
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          "ui-vendor": ["lucide-react", "recharts"],
          "utils-vendor": ["axios", "xlsx"],
        },
        // Optimize chunk file names
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Optimize build performance
    reportCompressedSize: false, // Disable gzip reporting for faster builds
    cssCodeSplit: true, // Enable CSS code splitting
  },

  // Optimize esbuild
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    legalComments: "none", // Remove comments for smaller bundle
    treeShaking: true,
  },

  // Optimize for production
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "axios",
      "lucide-react",
      "recharts",
      "xlsx",
    ],
  },

  // Server configuration for preview
  preview: {
    port: 3000,
    strictPort: true,
  },
});
