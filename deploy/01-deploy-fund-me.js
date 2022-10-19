/*
function deployFunc(hre){
    console.log('hELO');
    hre.getNamedAccounts();
    hre.deployments();
}
module.exports.default = deployFunc; //default export 
*/

/*module.exports =  async (hre) => {
    const {getNamedAccounts, deployments} = hre;
}*/

const {networkConfig, developmentChain} = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments; //we are pulling deploy and log functions from deployments object
    const {deployer} = await getNamedAccounts(); // deployer account from the function getNamedAccounts
    const chainId = network.config.chainId;

    const ethUsdPriceFeedAddress = networkConfig[4]["ethUsdPriceFeed"];
    /*let ethUsdPriceFeedAddress
    if(developmentChain.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }*/

                            //Name of contract to deploy
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //arguments of constructor
        log: true
    });
                            
}

module.exports.tags = ["all", "fundme"]

