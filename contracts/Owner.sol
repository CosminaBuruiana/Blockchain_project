// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


contract Owner
{
    receive() external payable {} // to support receiving ETH by default
    fallback() external payable {}

    address payable public ownerAddress;

    modifier onlyOwner {
        require(msg.sender == ownerAddress, "Only hotel owner can perform this action");
        _;
    }

    constructor () {
        ownerAddress = payable(msg.sender);
    }

    function getOwnerAddress() public view returns(address) {
        return ownerAddress;
    }

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function payOwner() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = ownerAddress.call{value: amount}("");
        require(success, "Transfer to owner address failed");
    }
}