// SPDX-License-Identifier: UNLICENSED"

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Faucet {

    using SafeERC20 for IERC20;

    IERC20 public token;

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    function giveTokens() external {
        uint requiredToken_toWei = 1000000 * 10 ** 18;
        
        token.safeTransfer(msg.sender, requiredToken_toWei);
    }
}