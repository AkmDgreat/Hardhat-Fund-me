//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConvertor.sol";

contract FundMe {

    using PriceConverter for uint256;
    uint256 public minimumUSD = 5 * 1e18; 
    address[] public fundersArray; 
    mapping(address => uint256) public addressToAmountFunded;
    address public owner;

    AggregatorV3Interface public priceFeed;

    constructor(address addressOfpriceFeed){ 
        //this is ETH/USD address (different on different chains(ethereum, avalanche, polygon etc.))
        owner = msg.sender; 
        priceFeed = AggregatorV3Interface(addressOfpriceFeed);
    }

    function fund() public payable {

    require(msg.value.getConversionRate(priceFeed) >= minimumUSD, "Didn't send enough!"); 
    fundersArray.push(msg.sender); 
    
     

    }

    function withdraw() public onlyOwner{
       
        for(uint256 funderIndex = 0; funderIndex < fundersArray.length; funderIndex++){
            address funder = fundersArray[funderIndex]; 
            addressToAmountFunded[funder] = 0; 
        }
        fundersArray = new address[](0); 
        
    (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(callSuccess, "Send failed");
    }
    modifier onlyOwner {
         require(msg.sender == owner, "Sender is not owner");
         _; 
    }
    
}


