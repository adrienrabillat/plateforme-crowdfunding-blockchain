import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // --- 1. Deploy AsthiaToken ---
  const tokenName = "Asthia Immo Lyon 1";
  const tokenSymbol = "AIL1";
  const tokenDecimals = 0; // Whole tokens (1 token = 1 share)

  const AsthiaToken = await ethers.getContractFactory("AsthiaToken");
  const token = await AsthiaToken.deploy(tokenName, tokenSymbol, tokenDecimals, deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`AsthiaToken "${tokenName}" deployed to: ${tokenAddress}`);

  // --- 2. Deploy CrowdfundingCampaign ---
  const tokenPriceCents = 10000;               // 100 EUR = 10000 cents
  const hardCapCents = 500000 * 100;            // 500,000 EUR
  const softCapCents = Math.floor(hardCapCents * 0.8); // 80% = 400,000 EUR
  const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

  const CrowdfundingCampaign = await ethers.getContractFactory("CrowdfundingCampaign");
  const campaign = await CrowdfundingCampaign.deploy(
    tokenAddress,
    tokenPriceCents,
    softCapCents,
    hardCapCents,
    deadline,
    deployer.address
  );
  await campaign.waitForDeployment();
  const campaignAddress = await campaign.getAddress();
  console.log(`CrowdfundingCampaign deployed to: ${campaignAddress}`);

  // --- 3. Grant MINTER_ROLE to campaign contract ---
  const MINTER_ROLE = await token.MINTER_ROLE();
  const tx = await token.grantRole(MINTER_ROLE, campaignAddress);
  await tx.wait();
  console.log("Granted MINTER_ROLE to CrowdfundingCampaign");

  // --- 4. Save deployment addresses ---
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AsthiaToken: {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
      },
      CrowdfundingCampaign: {
        address: campaignAddress,
        tokenPrice: tokenPriceCents,
        softCap: softCapCents,
        hardCap: hardCapCents,
        deadline: deadline,
      },
    },
  };

  const outputDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `deployment-${deployment.chainId}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment info saved to: ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
