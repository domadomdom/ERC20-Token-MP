const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("MedicalPoint Unit Test", function () {
      //Multipler is used to make reading the math easier because of the 18 decimal points
      const multiplier = 10 ** 18;
      let medicalPoint, deployer, user1;
      beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.user1;

        await deployments.fixture("all");
        medicalPoint = await ethers.getContract("MedicalPoint", deployer);
      });
      it("was deployed", async () => {
        assert(medicalPoint.address);
      });
      describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token ", async () => {
          const totalSupply = await medicalPoint.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initializes the token with the correct name and symbol ", async () => {
          const name = (await medicalPoint.name()).toString();
          assert.equal(name, "MedicalPoint");

          const symbol = (await medicalPoint.symbol()).toString();
          assert.equal(symbol, "MP");
        });
      });
      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.utils.parseEther("10");
          await medicalPoint.transfer(user1, tokensToSend);
          expect(await medicalPoint.balanceOf(user1)).to.equal(tokensToSend);
        });
        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            medicalPoint.transfer(user1, (10 * multiplier).toString())
          ).to.emit(medicalPoint, "Transfer");
        });
      });
      describe("allowances", () => {
        const amount = (20 * multiplier).toString();
        beforeEach(async () => {
          playerToken = await ethers.getContract("MedicalPoint", user1);
        });
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.utils.parseEther("5");
          await medicalPoint.approve(user1, tokensToSpend);
          const medicalPoint1 = await ethers.getContract("MedicalPoint", user1);
          await medicalPoint1.transferFrom(deployer, user1, tokensToSpend);
          expect(await medicalPoint1.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("doesn't allow an unnaproved member to do transfers", async () => {
          //Deployer is approving that user1 can spend 20 of their precious MP's

          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
        it("emits an approval event, when an approval occurs", async () => {
          await expect(medicalPoint.approve(user1, amount)).to.emit(
            medicalPoint,
            "Approval"
          );
        });
        it("the allowance being set is accurate", async () => {
          await medicalPoint.approve(user1, amount);
          const allowance = await medicalPoint.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("won't allow a user to go over the allowance", async () => {
          await medicalPoint.approve(user1, amount);
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });
    });
