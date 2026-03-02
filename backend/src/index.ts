import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

dotenv.config();

import kycRoutes from "./routes/kyc";
import assetRoutes from "./routes/assets";
import investRoutes from "./routes/invest";
import portfolioRoutes from "./routes/portfolio";
import userRoutes from "./routes/user";
import marketplaceRoutes from "./routes/marketplace";

const app = express();
const PORT = process.env.PORT || 4000;

// CORS  — allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth handler — MUST come BEFORE express.json()
app.all("/api/auth/*", toNodeHandler(auth));

// JSON middleware for all other routes
app.use(express.json());

// API routes
app.use("/api/kyc", kycRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/invest", investRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/user", userRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Asthia Backend is running on http://localhost:${PORT}`);
});
