import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export const config = {
  port: parseInt(process.env.PORT || "4000"),
  jwtSecret: process.env.JWT_SECRET || "asthia-dev-secret-change-me",
  amoyRpcUrl: process.env.AMOY_RPC_URL || "***SUPPRIME***",
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "***SUPPRIME***",
};
