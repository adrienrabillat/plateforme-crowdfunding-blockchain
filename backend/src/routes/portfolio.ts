import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /api/portfolio
router.get("/", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ error: "Non authentifié" });

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, walletAddress: true, kycStatus: true },
    });

    const transactions = await prisma.transactionFiat.findMany({
      where: { userId, status: "SUCCESS" },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
    });

    // Group by asset
    const assetMap = new Map<string, any>();
    for (const tx of transactions) {
      if (!assetMap.has(tx.assetId)) {
        assetMap.set(tx.assetId, {
          asset: {
            id: tx.asset.id,
            title: tx.asset.title,
            imageUrl: tx.asset.imageUrl,
            tokenPrice: tx.asset.tokenPrice,
            status: tx.asset.status,
          },
          totalInvested: 0,
          tokenCount: 0,
          transactions: [],
        });
      }
      const entry = assetMap.get(tx.assetId)!;
      entry.totalInvested += tx.amountEur;
      entry.tokenCount += Math.floor(tx.amountEur / tx.asset.tokenPrice);
      entry.transactions.push({
        id: tx.id,
        amountEur: tx.amountEur,
        date: tx.createdAt.toISOString(),
        txHash: tx.txHash,
      });
    }

    const investments = Array.from(assetMap.values());
    const totalValue = investments.reduce(
      (sum, inv) => sum + inv.totalInvested,
      0
    );

    res.json({
      user: user || { email: session.user.email, walletAddress: null, kycStatus: "PENDING" },
      totalValue,
      investments,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
