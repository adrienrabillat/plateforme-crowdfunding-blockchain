import { expect } from "chai";
import { ethers } from "hardhat";
import { AsthiaToken, CrowdfundingCampaign } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AsthiaToken", function () {
  let token: AsthiaToken;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async () => {
    [admin, user1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("AsthiaToken");
    token = await Factory.deploy("Asthia Immo Test", "AIT", 0, admin.address);
    await token.waitForDeployment();
  });

  it("should have correct name and symbol", async () => {
    expect(await token.name()).to.equal("Asthia Immo Test");
    expect(await token.symbol()).to.equal("AIT");
    expect(await token.decimals()).to.equal(0);
  });

  it("admin can mint tokens", async () => {
    await token.mint(user1.address, 100);
    expect(await token.balanceOf(user1.address)).to.equal(100);
  });

  it("non-admin cannot mint", async () => {
    const MINTER_ROLE = await token.MINTER_ROLE();
    await expect(
      token.connect(user1).mint(user1.address, 100)
    ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });

  it("admin can pause and unpause", async () => {
    await token.mint(user1.address, 100);
    await token.pause();
    await expect(
      token.connect(user1).transfer(admin.address, 10)
    ).to.be.revertedWithCustomError(token, "EnforcedPause");

    await token.unpause();
    await token.connect(user1).transfer(admin.address, 10);
    expect(await token.balanceOf(admin.address)).to.equal(10);
  });

  it("tokens can be burned", async () => {
    await token.mint(user1.address, 100);
    await token.connect(user1).burn(30);
    expect(await token.balanceOf(user1.address)).to.equal(70);
  });
});

describe("CrowdfundingCampaign", function () {
  let token: AsthiaToken;
  let campaign: CrowdfundingCampaign;
  let admin: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;

  const TOKEN_PRICE = 10000; // 100 EUR in cents
  const HARD_CAP = 100000 * 100; // 100,000 EUR in cents
  const SOFT_CAP = Math.floor(HARD_CAP * 0.8); // 80% = 80,000 EUR

  beforeEach(async () => {
    [admin, investor1, investor2] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("AsthiaToken");
    token = await TokenFactory.deploy("Test Token", "TT", 0, admin.address);
    await token.waitForDeployment();

    const deadline = (await time.latest()) + 30 * 24 * 60 * 60; // 30 days

    const CampaignFactory = await ethers.getContractFactory("CrowdfundingCampaign");
    campaign = await CampaignFactory.deploy(
      await token.getAddress(),
      TOKEN_PRICE,
      SOFT_CAP,
      HARD_CAP,
      deadline,
      admin.address
    );
    await campaign.waitForDeployment();

    // Grant MINTER_ROLE to campaign
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, await campaign.getAddress());
  });

  it("should start in ACTIVE state", async () => {
    expect(await campaign.state()).to.equal(0); // ACTIVE = 0
  });

  it("admin can pledge on behalf of an investor", async () => {
    const amount = 50000; // 500 EUR in cents
    await campaign.pledge(investor1.address, amount);
    expect(await campaign.pledges(investor1.address)).to.equal(amount);
    expect(await campaign.totalPledged()).to.equal(amount);
  });

  it("non-admin cannot pledge", async () => {
    await expect(
      campaign.connect(investor1).pledge(investor1.address, 50000)
    ).to.be.revertedWithCustomError(campaign, "AccessControlUnauthorizedAccount");
  });

  it("cannot pledge beyond hard cap", async () => {
    await campaign.pledge(investor1.address, HARD_CAP);
    await expect(
      campaign.pledge(investor2.address, 1)
    ).to.be.revertedWith("Would exceed hard cap");
  });

  it("full lifecycle: pledge → finalize SUCCESS → claimTokens", async () => {
    // Pledge enough to reach soft cap
    const amount = SOFT_CAP;
    await campaign.pledge(investor1.address, amount);

    // Fast-forward past deadline
    await time.increase(31 * 24 * 60 * 60);

    // Finalize
    await campaign.finalize();
    expect(await campaign.state()).to.equal(1); // SUCCESS = 1

    // Investor claims tokens
    const expectedTokens = amount / TOKEN_PRICE;
    await campaign.connect(investor1).claimTokens();
    expect(await token.balanceOf(investor1.address)).to.equal(expectedTokens);
  });

  it("full lifecycle: pledge → finalize FAILED → claimRefund", async () => {
    // Pledge less than soft cap
    const amount = SOFT_CAP - 1;
    await campaign.pledge(investor1.address, amount);

    // Fast-forward past deadline
    await time.increase(31 * 24 * 60 * 60);

    // Finalize
    await campaign.finalize();
    expect(await campaign.state()).to.equal(2); // FAILED = 2

    // Investor claims refund
    await campaign.connect(investor1).claimRefund();
    expect(await campaign.hasClaimed(investor1.address)).to.equal(true);
  });

  it("cannot claim tokens if campaign failed", async () => {
    await campaign.pledge(investor1.address, 100);
    await time.increase(31 * 24 * 60 * 60);
    await campaign.finalize();

    await expect(
      campaign.connect(investor1).claimTokens()
    ).to.be.revertedWith("Campaign not successful");
  });

  it("cannot claim refund if campaign succeeded", async () => {
    await campaign.pledge(investor1.address, SOFT_CAP);
    await time.increase(31 * 24 * 60 * 60);
    await campaign.finalize();

    await expect(
      campaign.connect(investor1).claimRefund()
    ).to.be.revertedWith("Campaign not failed");
  });

  it("cannot double claim", async () => {
    await campaign.pledge(investor1.address, SOFT_CAP);
    await time.increase(31 * 24 * 60 * 60);
    await campaign.finalize();
    await campaign.connect(investor1).claimTokens();

    await expect(
      campaign.connect(investor1).claimTokens()
    ).to.be.revertedWith("Already claimed");
  });
});
