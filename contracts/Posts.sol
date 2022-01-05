// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Accounts.sol";


contract Posts is OwnableUpgradeable {

    Accounts public accounts;

    uint256 FEE;
    int256 counter;

    mapping(int => Post) posts;

    event PostSubmitted(uint256 indexed author, uint256 indexed fee, string message);
    event Withdrawal(uint256 indexed amount);

    function initialize(address accounts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        accounts = Accounts(accounts_address);
        FEE = 0;
        counter = -1;
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

    function get_post(uint256 index) public view returns (Post memory) {
        require(int256(index) <= counter, "Post does not exist");
        return posts[int256(index)];
    }

    function submit_post(string memory message) payable public {
        //console.log("received %s tokens", msg.value);
        require(msg.value == FEE, "Incorrect fee paid");
        uint256 user_id = accounts.id_by_address(msg.sender);
        require(user_id > 0, "Cannot submit post: you are not signed up");
        counter++;
        posts[counter] = Post(message, user_id, block.timestamp);
        emit PostSubmitted(user_id, FEE, message);
    }

    function withdraw() public onlyOwner {
        address payable owner = payable(owner());
        uint256 amount = address(this).balance;
        bool success = owner.send(amount);
        require(success, "withdrawal failed");
        emit Withdrawal(amount);
    }
}

struct Post {
    string message;
    uint256 author;
    uint256 timestamp;
}