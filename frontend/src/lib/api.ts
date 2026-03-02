const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * API client for Asthia backend.
 * Uses cookie-based auth (Better Auth session cookies).
 */
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // send session cookies
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Erreur réseau" }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // ── KYC ──────────────────────────────────────────────────

  async submitKyc(data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
  }) {
    return this.request<{ status: string; message: string }>("/kyc/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getKycStatus() {
    return this.request<{ kycStatus: string }>("/kyc/status");
  }

  // ── Assets ───────────────────────────────────────────────

  async getAssets() {
    return this.request<any[]>("/assets");
  }

  async getAsset(id: string) {
    return this.request<any>(`/assets/${id}`);
  }

  // ── Invest ───────────────────────────────────────────────

  async invest(data: {
    assetId: string;
    amountEur: number;
    cardDetails: {
      cardNumber: string;
      expiry: string;
      cvv: string;
      holderName: string;
    };
  }) {
    return this.request<any>("/invest", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ── Portfolio ────────────────────────────────────────────

  async getPortfolio() {
    return this.request<any>("/portfolio");
  }

  // ── User ─────────────────────────────────────────────────

  async getMe() {
    return this.request<any>("/user/me");
  }

  async updateWallet(walletAddress: string) {
    return this.request<any>("/user/wallet", {
      method: "PUT",
      body: JSON.stringify({ walletAddress }),
    });
  }

  // ── Marketplace (Marché secondaire) ─────────────────────

  async getMarketplaceListings() {
    return this.request<any[]>("/marketplace");
  }

  async createMarketplaceListing(data: {
    assetId: string;
    tokenCount: number;
    pricePerToken: number;
  }) {
    return this.request<any>("/marketplace/list", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
