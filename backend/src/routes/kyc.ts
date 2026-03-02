import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

const router = Router();
const prisma = new PrismaClient();

// Middleware: get Better Auth session
async function getSession(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return session;
}

// POST /api/kyc/submit — mock KYC auto-approval
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Non authentifié" });

    // Auto-approve after 1s delay (mock)
    await new Promise((r) => setTimeout(r, 1000));

    await prisma.user.update({
      where: { id: session.user.id },
      data: { kycStatus: "APPROVED" },
    });

    res.json({ status: "APPROVED", message: "Identité vérifiée avec succès" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/kyc/status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Non authentifié" });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { kycStatus: true },
    });

    res.json({ kycStatus: user?.kycStatus || "PENDING" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
