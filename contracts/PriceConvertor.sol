//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


library PriceConverter{
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        (,int256 price,,,) = priceFeed.latestRoundData(); 
        return uint256(price * 1e10);
    }

    //The following function is just to illustrate a concept
    function getVersion() internal view returns(uint256) {
        return AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e).version();
        
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 priceOf1ETHInUSD = getPrice(priceFeed); 
        uint256 ethPriceInUsd = (priceOf1ETHInUSD * ethAmount) / 1e18; 
        return ethPriceInUsd;
    }
}

