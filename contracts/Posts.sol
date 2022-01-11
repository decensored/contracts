// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Accounts.sol";


contract Posts is OwnableUpgradeable {

    Accounts public accounts;

    int64 counter;

    mapping(uint64 => Post) posts;
    mapping(uint64 => uint64[]) public posts_by_author;
    mapping(uint64 => uint64[]) public replies_by_post;
    mapping(uint64 => uint64) public mother_post_by_reply;

    event PostSubmitted(uint64 indexed author, string message);
    event Withdrawal(uint64 indexed amount);

    function initialize(address accounts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        accounts = Accounts(accounts_address);
        counter = -1;
    }

    function get_latest_post_index() public view returns (int) {
        return counter;
    }

    function get_post(uint64 index) public view returns (Post memory) {
        require(int64(uint64(index)) <= counter, "Post does not exist");
        return posts[uint64(index)];
    }

    function submit_post(string memory message) public {

        uint64 user_id = accounts.id_by_address(msg.sender);
        require(user_id > 0, "Cannot submit post: you are not signed up");

        counter++;
        posts[uint64(counter)] = Post(message, user_id, uint64(block.timestamp));
        posts_by_author[user_id].push(uint64(counter));

        emit PostSubmitted(user_id, message);
    }

    function reply(uint64 mother_post, string memory message) public {
        require(int64(mother_post) <= counter, "Mother post does not exist");
        submit_post(message);
        mother_post_by_reply[uint64(counter)] = mother_post;
        replies_by_post[mother_post].push(uint64(counter));
    }

    function get_nth_post_index_by_author(uint64 author, uint64 n) public view returns(uint64) {
        return posts_by_author[author][n];
    }

    function get_amount_of_posts_by_author(uint64 author) public view returns(uint64) {
        return uint64(posts_by_author[author].length);
    }
}

struct Post {
    string message;
    uint64 author;
    uint64 timestamp;
}
