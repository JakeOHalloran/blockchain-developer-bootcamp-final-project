# Design pattern decisions
The following patterns, that were listed in the Final Project Design Patterns and Security Measures document, are used:

## Inter contract execution
- PrizeDraw contract calls SafeERC20 contract's function safeTransfer to send the funds from a Prize Draw to winner address.

## Access Control Design Patterns
- Restricting access to certain functions, like PrizeDraw.pickWinner() with onlyOwner() modifier from the Ownable library.

## Inheritance and Interfaces
- PrizeDraw is inheriting Ownable library from OpenZeppelin, and VRFConsumerBase from Chainlink.
- TestToken and PrizeDraw both make use IERC20/ERC20
