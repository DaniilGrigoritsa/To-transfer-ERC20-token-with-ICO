const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const provider = ethers.provider;

describe("ERC20TTT", function () {
  async function deployFixture() {
    const [owner, buyer, reciever] = await ethers.getSigners();
    const amount = new ethers.BigNumber.from(10).pow(18);
    const ERC20TTT = await ethers.getContractFactory("ERC20TTT", owner);
    const token = await ERC20TTT.deploy("ERC20TTT", "TTT", amount, 67680 , 10);
    await token.deployed();
    const TokenICO = await ethers.getContractFactory("TokenICO", owner);
    const ICOContract = await TokenICO.deploy(token.address);
    await ICOContract.deployed();

    return { token, ICOContract, owner, buyer, reciever };
  }

  async function deployFixtureWithTransferedTokens() {
    const [owner, buyer, reciever] = await ethers.getSigners();
    const amount = new ethers.BigNumber.from(10).pow(18);
    const ERC20TTT = await ethers.getContractFactory("ERC20TTT", owner);
    const token = await ERC20TTT.deploy("ERC20TTT", "TTT", amount, 67680 , 10);
    await token.deployed();
    const TokenICO = await ethers.getContractFactory("TokenICO", owner);
    const ICOContract = await TokenICO.deploy(token.address);
    await ICOContract.deployed();

    let ownerBalance = await token.balanceOf(owner.address);
    let ICOAddress = ICOContract.address;
    await token.setIcoContractAddress(ICOAddress);
    token.transfer(ICOAddress, ownerBalance);

    return { token, ICOContract, owner, buyer, reciever };
  }
  
  it("Should transfer tokens to ICO contract address", async function () {
    const { token, ICOContract, owner } = await loadFixture(deployFixture);
    let ownerBalance = await token.balanceOf(owner.address);
    let ICOAddress = ICOContract.address;
    token.transfer(ICOAddress, ownerBalance);
    expect(await token.balanceOf(ICOAddress)).to.equal(ownerBalance);
  })
  
  it("Buyer should purchase 42 tokens from ICO contract for 1 ether for the 1 ico period", async function () {
    const { token, ICOContract, owner, buyer } = await loadFixture(deployFixtureWithTransferedTokens);
    let buyerAddress = buyer.address;
    const tx = await ICOContract.connect(buyer).buyTokens({ value: 1 });
    expect(await token.balanceOf(buyerAddress)).to.equal(42); 
  })
  
  it("Buyer should purchase 21 tokens from ICO contract for 1 ether for the 2 ico period", async function () {
    await network.provider.send("evm_increaseTime", [3 * 24 * 60]); // increase time on 3 days
    await network.provider.send("evm_mine");
    const { token, ICOContract, owner, buyer } = await loadFixture(deployFixtureWithTransferedTokens);
    let buyerAddress = buyer.address;
    const tx = await ICOContract.connect(buyer).buyTokens({ value: 1 });
    expect(await token.balanceOf(buyerAddress)).to.equal(42); 
  })
  
  it("Buyer should purchase 8 tokens from ICO contract for 1 ether for the 2 ico period", async function () {
    await network.provider.send("evm_increaseTime", [30 * 24 * 60]); // increase time on 30 days
    await network.provider.send("evm_mine");
    const { token, ICOContract, owner, buyer } = await loadFixture(deployFixtureWithTransferedTokens);
    let buyerAddress = buyer.address;
    const tx = await ICOContract.connect(buyer).buyTokens({ value: 1 });
    expect(await token.balanceOf(buyerAddress)).to.equal(42); 
  })

  it("Should be reverted with error: Isn't in white list!", async function () {
    const { token, reciever } = await loadFixture(deployFixture);
    const amountToTransfer = 1; // hardcoded value for testing purposes
    expect(token.transferTokens(reciever, amountToTransfer)).to.be.revertedWith("Isn't in white list!");
  })
  
  it("Transaction should be reverted with error: Can't send less then one token", async function () {
    const { token, ICOContract, owner, buyer } = await loadFixture(deployFixtureWithTransferedTokens);
    expect(ICOContract.connect(buyer).buyTokens({ value: 0 })).to.be.revertedWith("Can't send less then one token"); 
  })
  
  it("Should correctly withdraw ether to owner address", async function () {
    const { ICOContract, owner, buyer } = await loadFixture(deployFixtureWithTransferedTokens);
    await buyer.sendTransaction({
      to: ICOContract.address,
      value: ethers.utils.parseEther("1", "ether"),
      gasLimit: 68000
    });
    expect(await ICOContract.withdraw()).to.changeEtherBalances([owner], [ethers.utils.parseEther("1")]);
  })
});

