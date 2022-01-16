// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./RateControl.sol";
import "./Accounts.sol";
import "./Spaces.sol";


contract Posts is OwnableUpgradeable {

    RateControl public rate_control;
    Accounts public accounts;
    Spaces public spaces;

    int64 counter;

    mapping(uint64 => Post) public posts;
    mapping(uint64 => uint64[]) public posts_by_space;
    mapping(uint64 => uint64[]) public posts_by_author;
    mapping(uint64 => uint64[]) public replies_by_post;
    mapping(uint64 => uint64) public mother_post_by_reply;

    event PostSubmitted(uint64 indexed author, string message);
    event Withdrawal(uint64 indexed amount);

    function initialize(address spaces_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        spaces = Spaces(spaces_address);
        accounts = spaces.accounts();
        rate_control = accounts.rate_control();
        counter = -1;
    }

    function get_latest_post_index() public view returns (int) {
        return counter;
    }

    function submit_post(uint64 space, string memory message) public {
        rate_control.perform_action(msg.sender);

        uint64 user_id = accounts.id_by_address(msg.sender);
        require(user_id > 0, "Cannot submit post: you are not signed up");

        uint64 index = uint64(++counter);
        posts[index] = Post(message, user_id, uint64(block.timestamp), space);
        posts_by_author[user_id].push(index);

        bool is_member_of_space = spaces.is_member(space, user_id);
        require(is_member_of_space, "Cannot submit post: you are not member of this space");
        posts_by_space[space].push(index);

        emit PostSubmitted(user_id, message);
    }

    function reply(uint64 mother_post, string memory message) public {
        require(int64(mother_post) <= counter, "Mother post does not exist");
        uint64 space = posts[mother_post].space;
        submit_post(space, message);
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
    uint64 space;
}
