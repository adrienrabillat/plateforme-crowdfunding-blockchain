import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

const router = Router();
const prisma = new PrismaClient();

// PUT /api/user/wallet — update wallet address
router.put("/wallet", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ error: "Non authentifié" });

    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: "walletAddress requis" });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress },
    });

    res.json({ walletAddress: updated.walletAddress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user/me — get current user profile
router.get("/me", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ error: "Non authentifié" });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      walletAddress: user.walletAddress,
      kycStatus: user.kycStatus,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
