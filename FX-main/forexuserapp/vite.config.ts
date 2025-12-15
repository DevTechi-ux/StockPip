import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import express from "express";

// Create Express app instance once
let expressApp: express.Application | null = null;

function getExpressApp() {
  if (!expressApp) {
    const serverInstance = createServer();
    const app = (serverInstance as { app: express.Application }).app;

    if (!app || typeof app !== 'function') {
      throw new Error('Express app is not initialized correctly.');
    }

    expressApp = app;
  }
  return expressApp;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: parseInt(process.env.PORT || '8080'),
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  ssr: {
    noExternal: [],
    external: ['metaapi.cloud-sdk']
  },
  optimizeDeps: {
    exclude: ['metaapi.cloud-sdk']
  }
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      // Initialize Express app
      const app = getExpressApp();
      console.log('✅ Express app initialized');
      
      // Add Express as middleware BEFORE Vite's default middleware
      // Express app is Connect-compatible, so we can use it directly
      server.middlewares.use((req, res, next) => {
        // Only handle /api/* routes with Express
        if (req.url && req.url.startsWith('/api')) {
          // Use Express app directly with error handling
          // Express will handle the response, so don't call next()
          app(req, res, (err: any) => {
            // Error handler - only called if Express encounters an error
            if (err) {
              console.error('[Vite Express Middleware] Error:', err);
              if (!res.headersSent) {
                res.statusCode = err.status || 500;
                res.end(err.message || 'Internal Server Error');
              }
            }
            // Don't call next() - Express handles the response
          });
        } else {
          // Let Vite handle non-API routes
          next();
        }
      });
      
      console.log('✅ Express middleware configured for /api/* routes');
    },
  };
}
