
const {network} = require("hardhat");
const {developmentChain, DECIMAL, INITIAL_ANSWER} = require("./helper-hardhat-config")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments; //we are pulling deploy and log functions from deployments object
    const {deployer} = await getNamedAccounts(); // deployer account from the function getNamedAccounts
    const chainId = network.config.chainId;

    //includes function see whether a variable is present in an array
    if (/*developmentChain.includes("hardhat") || developmentChain.includes("localhost") */ chainId == 31337) {
        log("Local network detected! Deploying mocks...") //console.log()
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMAL, INITIAL_ANSWER]
        });
        log("Mocks deployed...");
        log("----------------------------------------------");
    }
}

module.exports.tags = ["all", "mocks"];
//yarn hardhat deploy --tags mocks

 