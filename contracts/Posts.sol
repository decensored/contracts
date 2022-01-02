// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


contract Posts is Ownable {

    uint256 FEE = 9e16;
    int256 counter = -1;

    mapping(int => Tweet) messages;

    event MessageSent(address indexed author, uint256 indexed fee, string message);
    event Withdrawal(uint256 indexed amount);

    constructor() {
        
    }

    function get_latest_message_index() public view returns (int) {
        return counter;
    }

    function set_fee(uint256 fee_new) public onlyOwner {
        FEE = fee_new;
    }

    function get_fee() public view returns (uint256) {
        return FEE;
    }

    function get_message(uint256 index) public view returns (Tweet memory) {
        return messages[int256(index)];
    }

    function send_message(string memory message) payable public {
        //console.log("received %s tokens", msg.value);
        require(msg.value == FEE, "Incorrect fee paid");
        counter++;
        messages[counter] = Tweet(message, msg.sender, block.timestamp);
        emit MessageSent(msg.sender, FEE, message);
    }

    function withdraw() public onlyOwner {
        address payable owner = payable(owner());
        uint256 amount = address(this).balance;
        bool success = owner.send(amount);
        require(success, "withdrawal failed");
        emit Withdrawal(amount);
    }
}

struct Tweet {
    string message;
    address author;
    uint256 timestamp;
}