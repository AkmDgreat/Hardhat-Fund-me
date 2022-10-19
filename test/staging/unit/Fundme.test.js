const { assert, expect } = require("chai");
const {deployments, ethers, getNamedAccounts} = require("hardhat");

describe("FundMe", function () {

    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let sendValue = ethers.utils.parseEther("1"); //sendValue = 1e18 (ie. 1 ETH)    


    beforeEach( async function () {

        //const {deployer} = await getNamedAccounts();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); //will run all the files in deploy folder (as it has tag "all")
        fundMe = await ethers.getContract("FundMe", deployer); // FundMe contract connected to the deployer's account

        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);

    })
    
    describe("constructor", function () {
        it("sets the aggregator address correctly", async function(){
            const response = await fundMe.priceFeed(); 
            assert.equal( response, mockV3Aggregator.address);
        })
    })

    describe("fund", async function(){

        it("fails if you dont send atleast 5 ETH", async function(){
            //await expect(fundMe.fund()).to.be.reverted; //expect the fund function to be reverted
            await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!"); //more exact
        })

        it("adds funder to fundersArray", async function(){
            await fundMe.fund({ value: sendValue});
            const funder = await fundMe.fundersArray[0];
            assert.equal(funder, deployer);
        })
    })

    describe("withdraw", async function (){
        beforeEach(async function(){
            await fundMe.fund({ value: sendValue})
        }) // cuz b4 withdrawing, contract needs to hv funds

        it("withdraw ETH from a single funder", async function(){

            const initialFundMeBalance = await fundMe.provider.getBalance(fundMe.address); // balance of the contract b4 withdraw is called
            // initialFundMeBalance is calling the blockchain, it'll of type bigNumber
            const initialDeployerBalance = await fundMe.provider.getBalance(deployer); //initial balance of the person who alled the withrwa function

            const txnResponse = await fundMe.withdraw(); // withdraw function in called
            const txnReceipt = await txnResponse.wait(1);
            const {gasUsed, effectiveGasPrice} = txnReceipt; // pulling variables(or objects, sometimes) out of an object 
            const gasCost = gasUsed.mul(effectiveGasPrice); //multiplying bigNos.

            const finalFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const finalDeployerBalance = await fundMe.provider.getBalance(deployer); 

            assert.equal(finalFundMeBalance, 0); //after calling the withdraw fn, balance of fundMe = 0
            assert.equal(
                 finalDeployerBalance.add(gasCost).toString(),
                 initialDeployerBalance.add(initialFundMeBalance).toString()
                 ); // we r addin' big nos

        })

        //Now we'll test with multiple funders
        it("withraw with multiple funders", async function(){
            const accounts = await ethers.getSigners(); //gives us a buncha accounts

            for (let i = 1; i < 6; i++) { // i = 0 is the index of deployer
                const fundMeConnectedContract = await fundMe.connect(accounts[i]); //we connected the contract with an acc
                await fundMeConnectedContract.fund({ value: sendValue}); // contract needs to be funded b4 withdrwaing
            }

            const initialFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const initialDeployerBalance = await fundMe.provider.getBalance(deployer);

            const txnResponse = await fundMe.withdraw();
            const txnReceipt = await txnResponse.wait(1);
            const {gasUsed, effectiveGasPrice} = txnReceipt;  
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const finalFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const finalDeployerBalance = await fundMe.provider.getBalance(deployer); 

            assert.equal(finalFundMeBalance, 0); 
            assert.equal(
                 finalDeployerBalance.add(gasCost).toString(),
                 initialDeployerBalance.add(initialFundMeBalance).toString()
                 ); 

            //Makin' sure that the fundersArray is reset properly
            await expect(fundMe.fundersArray[0]).to.be.reverted; //cuz nothin' is stored in fundersArray[0]
            
            for (let i = 1; i < 6; i++) {
                assert.equal( await fundMe.addressToAmountFunded(accounts[i].address, 0))                
            }
        })

        it("Only allows the deployer/owner to withdraw", async function(){
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        })
    })
})