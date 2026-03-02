// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AsthiaToken
 * @notice ERC-20 token representing fractional ownership of a real-world asset.
 *         Each real asset deployed on Asthia gets its own token contract.
 * @dev Supports: Mint (admin), Burn, Pause/Unpause (admin), Role-Based Access Control.
 */
contract AsthiaToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint8 private _decimals;

    /**
     * @param name_    Token name, e.g. "Asthia Immo Lyon 1"
     * @param symbol_  Token symbol, e.g. "AIL1"
     * @param decimals_ Token decimals (typically 0 for whole-token fractions, or 18)
     * @param admin    The Asthia backend admin wallet address
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address admin
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint new tokens. Called by the backend after a successful fiat payment.
     * @param to     Investor wallet address (created by Privy WaaS)
     * @param amount Number of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // --- Overrides required by Solidity for multiple inheritance ---

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
