// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Strings.sol";

contract Owner {
    receive() external payable {}

    address payable public ownerAddress;

    modifier onlyOwner {
        require(msg.sender == ownerAddress, "Only hotel owner can perform this action");
        _;
    }

    constructor () {
        ownerAddress = payable(0xFE34d0EEA6f316dfE04d6DB4738cb7f8Ef3d0429);
    }

    function getOwnerAddress() public view returns(address) {
        return ownerAddress;
    }

    function payOwner() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = ownerAddress.call{value: amount}("");
        require(success, "Transfer to owner address failed");
    }

    //we override this method because we want to add onlyOwner modifier
    function getBalance() public view onlyOwner returns(uint256) {
        return address(this).balance;
    }
}