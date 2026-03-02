import { IPaymentProvider, MockCardDetails, PaymentResult } from "./IPaymentProvider";
import { randomUUID } from "crypto";

/**
 * MockPaymentProvider — Simulates a credit card payment.
 * Waits 2 seconds, then returns MOCK_SUCCESS 95% of the time.
 * 
 * In production, replace this with LemonwayPaymentProvider or MtPelerinPaymentProvider.
 */
export class MockPaymentProvider implements IPaymentProvider {
  async processPayment(
    userId: string,
    amount: number,
    cardDetails: MockCardDetails
  ): Promise<PaymentResult> {
    // Simulate processing delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 95% success rate for realistic simulation
    const isSuccess = Math.random() < 0.95;
    const transactionId = randomUUID();

    if (isSuccess) {
      return {
        success: true,
        transactionId,
        status: "MOCK_SUCCESS",
        message: `Paiement de ${amount}€ validé (simulation).`,
      };
    } else {
      return {
        success: false,
        transactionId,
        status: "MOCK_FAILED",
        message: "Paiement refusé (simulation). Veuillez réessayer.",
      };
    }
  }
}
