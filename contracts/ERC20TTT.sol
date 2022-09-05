// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ERC20TTT is ERC20, Ownable{
    uint ICOEndTime;
    uint tokensAvailable;
    bool reentrant = false;
    address ICOAddress;

    /**
     * @dev List of users eligeble to transfer token before ICO. Only owner is able to add and remove users from white list 
     */
    address[] whiteList;

    /** 
     * @dev Created to prevent gas leak
     */
    uint whiteListMaxCapacity;

    /**
     * @dev This mapping is created to store a place of user's address in white list to avoid for loops due to decrease gas fees
     */
    mapping (address => uint) locationOfUserInWhiteListArray;


    constructor(
        string memory name,
        string memory symbol,
        uint initialSupply,
        uint ICOduration,
        uint _whiteListMaxCapacity
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        ICOEndTime = block.timestamp + ICOduration;
        whiteListMaxCapacity = _whiteListMaxCapacity;
        tokensAvailable = initialSupply;
    }


    modifier allowedToTransfer(address candidate) {
        if (block.timestamp > ICOEndTime) {
            _;
        } else {
            require(isInWhitelist(candidate), "Isn't in white list!");
            _;
        }
    }


    modifier ICONotFinished(uint currentTime) {
        require(block.timestamp < ICOEndTime, "ICO have already finished!");
        _;
    }


    function isInWhitelist(address candidate) internal view returns(bool) {
        for (uint iter = 0; iter < whiteList.length; iter++) {
            if (candidate == whiteList[iter]) {
                return true;
            }
        }
        return false;
    }


    function addToWhiteList(address userAddress) external onlyOwner {
        require(whiteList.length < whiteListMaxCapacity, "Max address array exceeded");
        require(userAddress != address(0), "Zero address!");
        whiteList.push(userAddress);
        locationOfUserInWhiteListArray[userAddress] = whiteList.length;
    }


    function removeFromWhiteList(address userAddress) external onlyOwner {
        uint locationInArray;
        locationInArray = locationOfUserInWhiteListArray[userAddress];
        require(locationInArray != 0, "Try to delete unexisting address!");
        locationOfUserInWhiteListArray[userAddress] = 0;
        delete whiteList[locationInArray - 1];
    }


    function transferTokens(address to, uint amount) external allowedToTransfer(msg.sender) {
        require(amount > 0, "Amount to transfer can't be zero!");
        require(to != address(0));
        transfer(to, amount);
    }

    
    function buyTokensFromICO(address to , uint amount) external ICONotFinished(block.timestamp) {
        require(ICOAddress != address(0), "ICO address hasn't been started yet");
        require(address(msg.sender) == ICOAddress, "Execution reverted!");
        require(tokensAvailable >= amount, "Sold out!");
        tokensAvailable -= amount;
        transfer(to, amount);
    }


    function changeWhiteListMaxCapacity(uint newCapacity) external onlyOwner {
        whiteListMaxCapacity = newCapacity;
    }


    function setIcoContractAddress(address _ICOAddress) external onlyOwner {
        require(!reentrant, "ICO contract address hes already been set!");
        reentrant = true;
        ICOAddress = _ICOAddress;
    }
}
