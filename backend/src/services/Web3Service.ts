import { ethers } from "ethers";
import { config } from "../config";

// ABI fragments — only the functions we call
const CAMPAIGN_ABI = [
  "function pledge(address investor, uint256 amount) external",
  "function finalize() external",
  "function totalPledged() view returns (uint256)",
  "function state() view returns (uint8)",
  "function getProgress() view returns (uint256 raised, uint256 goal)",
  "function pledges(address) view returns (uint256)",
];

const TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

/**
 * Web3Service — Interacts with smart contracts on Polygon Amoy.
 * Uses the admin wallet (private key in .env) to sign transactions.
 */
export class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private adminWallet: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.amoyRpcUrl);

    if (!config.adminPrivateKey) {
      console.warn("⚠️  ADMIN_PRIVATE_KEY not set. Web3 transactions will fail.");
      // Create a dummy wallet for development
      this.adminWallet = ethers.Wallet.createRandom().connect(this.provider);
    } else {
      this.adminWallet = new ethers.Wallet(config.adminPrivateKey, this.provider);
    }

    console.log(`🔗 Web3Service initialized. Admin wallet: ${this.adminWallet.address}`);
  }

  /**
   * Record a pledge on the CrowdfundingCampaign contract.
   * Called after a successful fiat payment.
   */
  async pledgeOnChain(
    campaignAddress: string,
    investorAddress: string,
    amountCents: number
  ): Promise<string> {
    try {
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.adminWallet);
      const tx = await campaign.pledge(investorAddress, amountCents);
      const receipt = await tx.wait();
      console.log(`✅ Pledge recorded on-chain. Tx: ${receipt.hash}`);
      return receipt.hash;
    } catch (error: any) {
      console.error("❌ Pledge on-chain failed:", error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  /**
   * Get the token balance of a wallet for a given token contract.
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<number> {
    const token = new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
    const balance = await token.balanceOf(walletAddress);
    return Number(balance);
  }

  /**
   * Get campaign progress (raised vs goal).
   */
  async getCampaignProgress(campaignAddress: string): Promise<{ raised: number; goal: number }> {
    const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
    const [raised, goal] = await campaign.getProgress();
    return { raised: Number(raised), goal: Number(goal) };
  }

  /**
   * Get campaign state (0=ACTIVE, 1=SUCCESS, 2=FAILED).
   */
  async getCampaignState(campaignAddress: string): Promise<number> {
    const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
    return Number(await campaign.state());
  }

  /**
   * Get admin wallet address.
   */
  getAdminAddress(): string {
    return this.adminWallet.address;
  }
}
