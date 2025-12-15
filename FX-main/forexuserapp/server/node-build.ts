import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer } from "./index";

const { app, server } = createServer();
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../spa");

app.use(express.static(distPath));

// Serve SPA for non-API/non-health routes (Express 5 safe)
app.get(/^(?!\/api\/|\/health).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

server.listen(port, host, () => {
  console.log(`🚀 Fusion Starter server running on http://${host}:${port}`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
