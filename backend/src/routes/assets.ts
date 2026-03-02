import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/assets
 * List all assets with current fundraising progress.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
    });

    const enriched = assets.map((a) => ({
      ...a,
      progressPercent: a.hardCap > 0 ? Math.round((a.currentRaised / a.hardCap) * 100) : 0,
      remainingDays: Math.max(0, Math.ceil((new Date(a.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    }));

    res.json(enriched);
  } catch (error: any) {
    console.error("Assets list error:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

/**
 * GET /api/assets/:id
 * Get a single asset with full details.
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) {
      res.status(404).json({ error: "Actif non trouvé." });
      return;
    }

    res.json({
      ...asset,
      progressPercent: asset.hardCap > 0 ? Math.round((asset.currentRaised / asset.hardCap) * 100) : 0,
      remainingDays: Math.max(0, Math.ceil((new Date(asset.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    });
  } catch (error: any) {
    console.error("Asset detail error:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

export default router;
