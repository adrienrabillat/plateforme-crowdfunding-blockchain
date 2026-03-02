import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/marketplace
 * List all active marketplace listings.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { status: "ACTIVE" },
      include: {
        asset: { select: { title: true, tokenPrice: true } },
        seller: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = listings.map((l) => ({
      id: l.id,
      assetTitle: l.asset.title,
      tokenCount: l.tokenCount,
      pricePerToken: l.pricePerToken,
      totalPrice: l.tokenCount * l.pricePerToken,
      sellerEmail: l.seller.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
      createdAt: l.createdAt.toISOString(),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error("Marketplace list error:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

/**
 * POST /api/marketplace/list
 * Create a new marketplace listing (requires auth).
 */
router.post("/list", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    const { assetId, tokenCount, pricePerToken } = req.body;

    if (!assetId || !tokenCount || !pricePerToken) {
      res.status(400).json({ error: "Données manquantes." });
      return;
    }

    const listing = await prisma.marketplaceListing.create({
      data: {
        sellerId: session.user.id,
        assetId,
        tokenCount: parseInt(tokenCount),
        pricePerToken: parseFloat(pricePerToken),
      },
    });

    res.status(201).json(listing);
  } catch (error: any) {
    console.error("Marketplace list error:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

export default router;
