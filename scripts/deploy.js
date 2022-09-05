const hre = require("hardhat");

async function main() {
  const ERC20TTT = await hre.ethers.getContractFactory("ERC20TTT");

  /** 
   * @param {uint} initialSupply [Initial supply is 10^18 tokens]
   * @param {uint} ICOduration [iCO duration is (3 + 30 + (2 * 7)) * 24 * 60 = 67680 seconds]
   * @param {uint} _maxWhiteListCapacity [Max white list capacity 10 (optional)]
   * @dev ERC20TTT deployed to goerli testnet adderss: 0x70a727a3c715678eFD11fBa8BD0064C740Abe06e
   */
  const amount = new ethers.BigNumber.from(10).pow(18);
  const token = await ERC20TTT.deploy("ERC20TTT", "TTT", amount, 67680 , 10);
  await token.deployed();
  console.log(token.address);

  /**
   *@dev TokenICO  deployed to goerli testnet adderss: 0x18F3A34630DB530a3C5E1D168a88d8379F021356
   */
  const ERC20TTTAddress = token.address;
  const TokenICO = await hre.ethers.getContractFactory("TokenICO");
  const ICO = await TokenICO.deploy(ERC20TTTAddress);
  await ICO.deployed();
  console.log(ICO.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
