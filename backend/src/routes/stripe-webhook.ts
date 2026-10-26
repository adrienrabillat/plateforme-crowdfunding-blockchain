import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { StripeService } from "../services/StripeService";
import { Web3Service } from "../services/Web3Service";

const router = Router();
const stripeService = new StripeService();

/**
 * POST /api/stripe/webhook
 * Stripe sends events here when payment status changes.
 * This is a safety net — the primary confirmation is via /api/invest/confirm.
 *
 * IMPORTANT: This route must receive raw body (not JSON-parsed).
 * It's registered BEFORE express.json() in index.ts.
 */
router.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  try {
    const event = stripeService.constructWebhookEvent(req.body, signature);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const transactionId = paymentIntent.metadata?.transactionId;
      const stripePaymentId = paymentIntent.id;

      if (!transactionId) {
        console.warn("Webhook: PaymentIntent without transactionId metadata");
        res.json({ received: true });
        return;
      }

      // Idempotency check: verify we haven't already minted for this Stripe payment
      const transaction = await prisma.transactionFiat.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        console.warn(`Webhook: Transaction ${transactionId} not found`);
        res.json({ received: true });
        return;
      }

      if (transaction.status === "SUCCESS") {
        // Already fully processed — skip
        console.log(`Webhook: Transaction ${transactionId} already SUCCESS, skipping`);
        res.json({ received: true });
        return;
      }

      // Only process PENDING or CONFIRMED transactions
      if (transaction.status !== "PENDING" && transaction.status !== "CONFIRMED") {
        console.log(`Webhook: Transaction ${transactionId} has status ${transaction.status}, skipping`);
        res.json({ received: true });
        return;
      }

      // Check if we already minted tokens for this payment (double-mint guard)
      if (transaction.paymentRef === stripePaymentId && transaction.txHash) {
        console.log(`Webhook: Tokens already minted for ${stripePaymentId}, skipping`);
        res.json({ received: true });
        return;
      }

      console.log(`🔔 Webhook: Processing payment for transaction ${transactionId}`);

      // Get user and asset for on-chain operations
      const user = await prisma.user.findUnique({ where: { id: transaction.userId } });
      const asset = await prisma.asset.findUnique({ where: { id: transaction.assetId } });

      // Mint tokens on-chain
      let txHash: string | null = null;
      if (asset?.tokenAddress && user?.walletAddress && transaction.tokenCount) {
        try {
          const web3 = new Web3Service();
          txHash = await web3.mintTokens(
            asset.tokenAddress,
            user.walletAddress,
            transaction.tokenCount
          );
        } catch (err) {
          console.error("Webhook: Token mint failed:", err);
        }
      }

      // Finalize transaction
      await prisma.transactionFiat.update({
        where: { id: transactionId },
        data: { status: "SUCCESS", txHash },
      });

      await prisma.asset.update({
        where: { id: transaction.assetId },
        data: { currentRaised: { increment: transaction.amountEur } },
      });

      console.log(`✅ Webhook: Transaction ${transactionId} confirmed via webhook`);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const transactionId = paymentIntent.metadata?.transactionId;

      if (transactionId) {
        await prisma.transactionFiat.update({
          where: { id: transactionId },
          data: { status: "FAILED" },
        });
        console.log(`❌ Webhook: Transaction ${transactionId} marked as FAILED`);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
});

export default router;
