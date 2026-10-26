import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { Web3Service } from "../services/Web3Service";

const router = Router();

/**
 * POST /api/campaigns/finalize
 * Finalize campaigns that have passed their deadline.
 * Sets the campaign state to SUCCESS or FAILED on-chain,
 * and updates the asset status in the database.
 */
router.post("/finalize", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    // RBAC: Check if user has admin role
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
    if (!adminEmails.includes(session.user.email)) {
      res.status(403).json({ error: "Vous n'avez pas les permissions pour finaliser les campagnes." });
      return;
    }

    // Find assets with campaigns past their deadline that are still ACTIVE
    const expiredAssets = await prisma.asset.findMany({
      where: {
        status: "ACTIVE",
        campaignAddress: { not: null },
        endDate: { lte: new Date() },
      },
    });

    if (expiredAssets.length === 0) {
      res.json({ message: "Aucune campagne à finaliser.", finalized: [] });
      return;
    }

    const web3 = new Web3Service();
    const results: Array<{ assetId: string; title: string; newStatus: string; txHash: string | null }> = [];

    for (const asset of expiredAssets) {
      let txHash: string | null = null;
      let newStatus = "ACTIVE";

      try {
        // 1. Finalize on-chain
        if (asset.campaignAddress) {
          txHash = await web3.finalizeCampaign(asset.campaignAddress);

          // 2. Check the resulting state (0=ACTIVE, 1=SUCCESS, 2=FAILED)
          const state = await web3.getCampaignState(asset.campaignAddress);
          newStatus = state === 1 ? "SUCCESS" : state === 2 ? "FAILED" : "ACTIVE";
        } else {
          // No campaign contract — finalize based on soft cap in DB
          newStatus = asset.currentRaised >= asset.softCap ? "SUCCESS" : "FAILED";
        }

        // 3. Update asset status in DB
        await prisma.asset.update({
          where: { id: asset.id },
          data: { status: newStatus },
        });

        results.push({
          assetId: asset.id,
          title: asset.title,
          newStatus,
          txHash,
        });
      } catch (err: any) {
        console.error(`Failed to finalize campaign for ${asset.title}:`, err.message);
        results.push({
          assetId: asset.id,
          title: asset.title,
          newStatus: "ERROR",
          txHash: null,
        });
      }
    }

    res.json({ message: `${results.length} campagne(s) traitée(s).`, finalized: results });
  } catch (error: any) {
    console.error("Campaign finalize error:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

/**
 * GET /api/campaigns/status/:assetId
 * Get on-chain campaign status for a specific asset.
 */
router.get("/status/:assetId", async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });

    if (!asset) {
      res.status(404).json({ error: "Actif introuvable." });
      return;
    }

    if (!asset.campaignAddress) {
      res.json({ status: asset.status, onChain: false });
      return;
    }

    const web3 = new Web3Service();
    const state = await web3.getCampaignState(asset.campaignAddress);
    const progress = await web3.getCampaignProgress(asset.campaignAddress);
    const stateNames = ["ACTIVE", "SUCCESS", "FAILED"];

    res.json({
      status: asset.status,
      onChain: true,
      chainState: stateNames[state] || "UNKNOWN",
      raised: progress.raised,
      goal: progress.goal,
      campaignAddress: asset.campaignAddress,
    });
  } catch (error: any) {
    console.error("Campaign status error:", error);
    res.status(500).json({ error: "Erreur interne." });
  }
});

export default router;
