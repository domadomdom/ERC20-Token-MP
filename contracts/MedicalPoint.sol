//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MedicalPoint is ERC20 {
    uint constant _initial_supply = 10000000 * (10**18);

    constructor(uint256 initialSupply) ERC20("MedicalPoint", "MP") {
        _mint(msg.sender, initialSupply);
    }
}
