/**
 * IPaymentProvider — Interface for payment service.
 * 
 * This is the KEY EXTENSION POINT for production.
 * Replace MockPaymentProvider with a Lemonway/Mt Pelerin implementation
 * without touching any other code.
 */

export interface MockCardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: "MOCK_SUCCESS" | "MOCK_FAILED";
  message: string;
}

export interface IPaymentProvider {
  processPayment(
    userId: string,
    amount: number,
    cardDetails: MockCardDetails
  ): Promise<PaymentResult>;
}
