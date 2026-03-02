// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./AsthiaToken.sol";

/**
 * @title CrowdfundingCampaign
 * @notice Manages a fundraising campaign for a specific real-world asset.
 *         The backend records pledges after fiat payment validation.
 *         Investors can claim tokens on SUCCESS or refunds on FAILED.
 *
 * States:
 *   ACTIVE  — Campaign is open for pledges
 *   SUCCESS — Soft cap reached (>= 80%), investors can claim tokens
 *   FAILED  — Deadline passed without soft cap, investors can reclaim virtual stakes
 */
contract CrowdfundingCampaign is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum CampaignState { ACTIVE, SUCCESS, FAILED }

    AsthiaToken public token;
    uint256 public tokenPrice;      // Price per token in cents (EUR * 100)
    uint256 public softCap;         // Minimum amount in cents to succeed
    uint256 public hardCap;         // Maximum amount in cents
    uint256 public deadline;        // Unix timestamp
    CampaignState public state;

    uint256 public totalPledged;    // Total amount pledged in cents

    // investor address => amount pledged in cents
    mapping(address => uint256) public pledges;
    // investor address => whether they have claimed
    mapping(address => bool) public hasClaimed;

    address[] private investors;
    mapping(address => bool) private isInvestor;

    // --- Events ---
    event Pledged(address indexed investor, uint256 amount);
    event CampaignFinalized(CampaignState newState);
    event TokensClaimed(address indexed investor, uint256 tokenAmount);
    event RefundClaimed(address indexed investor, uint256 amount);

    constructor(
        address tokenAddress,
        uint256 _tokenPrice,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _deadline,
        address admin
    ) {
        require(_softCap <= _hardCap, "Soft cap must be <= hard cap");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_tokenPrice > 0, "Token price must be > 0");

        token = AsthiaToken(tokenAddress);
        tokenPrice = _tokenPrice;
        softCap = _softCap;
        hardCap = _hardCap;
        deadline = _deadline;
        state = CampaignState.ACTIVE;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @notice Record a pledge for an investor. Called by the Asthia backend
     *         AFTER the fiat payment has been validated (Mock or real PSP).
     * @param investor The investor's wallet address (from Privy WaaS)
     * @param amount   The pledged amount in EUR cents
     */
    function pledge(address investor, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(state == CampaignState.ACTIVE, "Campaign is not active");
        require(block.timestamp <= deadline, "Campaign deadline has passed");
        require(totalPledged + amount <= hardCap, "Would exceed hard cap");
        require(amount > 0, "Amount must be > 0");

        if (!isInvestor[investor]) {
            investors.push(investor);
            isInvestor[investor] = true;
        }

        pledges[investor] += amount;
        totalPledged += amount;

        emit Pledged(investor, amount);
    }

    /**
     * @notice Finalize the campaign. Can be called by anyone after the deadline.
     *         Sets state to SUCCESS if soft cap reached, FAILED otherwise.
     */
    function finalize() external {
        require(state == CampaignState.ACTIVE, "Already finalized");
        require(
            block.timestamp > deadline || totalPledged >= hardCap,
            "Campaign still active"
        );

        if (totalPledged >= softCap) {
            state = CampaignState.SUCCESS;
        } else {
            state = CampaignState.FAILED;
        }

        emit CampaignFinalized(state);
    }

    /**
     * @notice Investor claims their tokens after a SUCCESS campaign.
     *         The campaign contract must hold MINTER_ROLE on the token.
     */
    function claimTokens() external {
        require(state == CampaignState.SUCCESS, "Campaign not successful");
        require(pledges[msg.sender] > 0, "No pledge found");
        require(!hasClaimed[msg.sender], "Already claimed");

        uint256 pledgedAmount = pledges[msg.sender];
        uint256 tokenAmount = pledgedAmount / tokenPrice;
        require(tokenAmount > 0, "Token amount is zero");

        hasClaimed[msg.sender] = true;
        token.mint(msg.sender, tokenAmount);

        emit TokensClaimed(msg.sender, tokenAmount);
    }

    /**
     * @notice Investor reclaims their virtual stake after a FAILED campaign.
     *         In the MVP, this just resets the pledge and emits an event.
     *         A real implementation would trigger a fiat refund via the PSP.
     */
    function claimRefund() external {
        require(state == CampaignState.FAILED, "Campaign not failed");
        require(pledges[msg.sender] > 0, "No pledge found");
        require(!hasClaimed[msg.sender], "Already claimed");

        uint256 amount = pledges[msg.sender];
        hasClaimed[msg.sender] = true;

        emit RefundClaimed(msg.sender, amount);
    }

    // --- View functions ---

    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }

    function getProgress() external view returns (uint256 raised, uint256 goal) {
        return (totalPledged, hardCap);
    }

    function getPledge(address investor) external view returns (uint256) {
        return pledges[investor];
    }
}
