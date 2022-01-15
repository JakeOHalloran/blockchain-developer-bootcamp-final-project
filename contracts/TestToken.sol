import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity 0.8.7;

contract TestToken is ERC20 {
    constructor(uint256 intialSupply) ERC20 ("TestToken", "TT") {
        _mint(msg.sender,intialSupply);
    }
}