# ERC20 contract with ICO

This project represents two smart contracts:

1. Token contract inherited from ERC20.sol openzeppelin contract
2. ICO smart contract created to propagate tokens

Note that contract has a white list (whiteList array), only users from this array are able to transfer tokens before ICO expiring, only owner of a ERC20TTT.sol contract can add users to white list and also remove them

ICO smart contract has three periods of token purchasing

To start a project clone this repository and install all dependencies using: `npm install` (if you have npm setup) 

**Available scripts:**

Contracts deployment:
`npx hardhat run scripts/deploy.js --network goerli`

Contracts testing using chai:
`npx hardhat test`

Contracts testing with coverage:
`npx hardhat coverage`


