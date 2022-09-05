// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
import "@openzeppelin/contracts/access/Ownable.sol";


interface IERC20TTT {
    function buyTokensFromICO(address, uint) external;
}


contract TokenICO is Ownable {
    uint FirstPeriod;
    uint SecondPeriod;
    uint ThirdPeriod;

    IERC20TTT token;


    constructor(address tokenAddress) {
        FirstPeriod = block.timestamp + 3 days;
        SecondPeriod = FirstPeriod + 30 days;
        ThirdPeriod = SecondPeriod + 2 weeks;

        token = IERC20TTT(tokenAddress);
    }

    
    function buyTokens() external payable {
        uint tokenPrice = tokensPerEther(block.timestamp);
        uint amount = msg.value * tokenPrice / (1 ether);
        address recipient = msg.sender;
        require(amount > 1, "Can't send less then one token");

        token.buyTokensFromICO(recipient, amount); 
    }


    function tokensPerEther(uint currentTime) internal view returns(uint) {
        if (currentTime < FirstPeriod) {
            return 42;
        }

        if (currentTime < SecondPeriod && currentTime > ThirdPeriod) {
            return 21;
        }

        if (currentTime > ThirdPeriod) {
            return 8;
        }

        return 0;
    }


    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }


    receive() external payable {}

}
