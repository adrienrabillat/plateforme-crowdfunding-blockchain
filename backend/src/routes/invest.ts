import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { MockPaymentProvider } from "../services/MockPaymentProvider";
import { Web3Service } from "../services/Web3Service";

const router = Router();
const prisma = new PrismaClient();
const paymentProvider = new MockPaymentProvider();

// POST /api/invest — full investment tunnel
router.post("/", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ error: "Non authentifié" });

    const userId = session.user.id;

    // 1. Check KYC
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.kycStatus !== "APPROVED") {
      return res.status(403).json({ error: "KYC non validé" });
    }

    const { assetId, amountEur, cardDetails } = req.body;

    // 2. Check asset
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.status !== "ACTIVE") {
      return res.status(404).json({ error: "Actif non disponible" });
    }

    if (amountEur < asset.tokenPrice) {
      return res.status(400).json({ error: `Montant minimum : ${asset.tokenPrice} €` });
    }

    // 3. Create pending transaction
    const transaction = await prisma.transactionFiat.create({
      data: {
        userId,
        assetId,
        amountEur,
        status: "PENDING",
      },
    });

    // 4. Process mock payment
    const paymentResult = await paymentProvider.processPayment(
      userId,
      amountEur,
      cardDetails
    );

    if (!paymentResult.success) {
      await prisma.transactionFiat.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
      return res.status(402).json({ error: paymentResult.message || "Paiement refusé" });
    }

    // 5. On-chain pledge (if contract available)
    let txHash: string | null = null;
    if (asset.campaignAddress && user.walletAddress) {
      try {
        const web3 = new Web3Service();
        txHash = await web3.pledgeOnChain(
          asset.campaignAddress,
          user.walletAddress,
          Math.round(amountEur * 100) // convert to cents
        );
      } catch (err) {
        console.error("On-chain pledge failed (non-blocking):", err);
      }
    }

    // 6. Update transaction and asset
    await prisma.transactionFiat.update({
      where: { id: transaction.id },
      data: {
        status: "SUCCESS",
        paymentRef: paymentResult.transactionId,
        txHash,
      },
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { currentRaised: { increment: amountEur } },
    });

    res.json({
      success: true,
      transactionId: transaction.id,
      amountEur,
      paymentRef: paymentResult.transactionId,
      txHash,
      message: "Investissement enregistré avec succès",
    });
  } catch (error: any) {
    console.error("Invest error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
