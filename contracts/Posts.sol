// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Contracts.sol";
import "./Old_Posts.sol";


contract Posts is OwnableUpgradeable {

    Contracts public contracts;

    uint64 private amount_of_posts;

    mapping(uint64 => Post) public posts;

    mapping(uint64 => uint64[]) public posts_by_space;
    mapping(uint64 => uint64[]) public posts_by_author;
    mapping(uint64 => uint64[]) public replies_by_post;

    event PostSubmitted(uint64 indexed author, string message);
    event Withdrawal(uint64 indexed amount);

    function initialize(address contracts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        contracts = Contracts(contracts_address);
        amount_of_posts = 0;
    }

    function get_amount_of_posts() public view returns (uint64) {
        return amount_of_posts;
    }

    function submit_post(uint64 space, string memory message) public {
        _submit_post(space, message, 0);
    }

    function get_amount_of_posts_by_space(uint64 space) public view returns(uint64) {
        return uint64(posts_by_space[space].length);
    }

    function get_amount_of_posts_by_author(uint64 author) public view returns(uint64) {
        return uint64(posts_by_author[author].length);
    }

    function get_amount_of_replies_by_post(uint64 post) public view returns(uint64) {
        return uint64(replies_by_post[post].length);
    }

    function submit_reply(uint64 mother_post, string memory message) public {
        require(0 < mother_post && mother_post <= amount_of_posts, "Mother post does not exist");
        uint64 space = posts[mother_post].space;
        _submit_post(space, message, mother_post);
        replies_by_post[mother_post].push(amount_of_posts);
    }

    function delete_post(uint64 index) public {
        Post memory post = posts[index];
        uint64 account_id = contracts.accounts().id_by_address(msg.sender);
        require(post.author == account_id && account_id > 0, "Cannot delete post: you are not the author.");
        post.message = "";
        post.deleted = true;
        posts[index] = post;
    }

    function _submit_post(uint64 space, string memory message, uint64 mother_post) internal {
        contracts.rate_control().perform_action(msg.sender);

        uint64 user_id = contracts.accounts().id_by_address(msg.sender);
        require(user_id > 0, "Cannot submit post: you are not signed up");

        uint256 length = bytes(message).length;
        require(length <= 280, "Cannot submit post: message too long");

        bool isAllowedToPost = contracts.spaces().is_allowed(space, user_id, msg.sender);
        require(isAllowedToPost, "Cannot submit post: you don't have the rights to post in this space!");

        bool is_blacklisted = contracts.spaces().is_blacklisted(space, user_id);
        require(!is_blacklisted, "Cannot submit post: you are on this space's blacklist");

        _add_post(space, user_id, uint64(block.timestamp), message, mother_post);

        emit PostSubmitted(user_id, message);
    }

    function _add_post(uint64 space, uint64 author, uint64 timestamp, string memory message, uint64 mother_post) internal {
        uint64 index = uint64(++amount_of_posts);
        posts[index] = Post(message, author, timestamp, space, mother_post, false);
        posts_by_author[author].push(index);
        posts_by_space[space].push(index);
    }

    function get_nth_post_index_by_author(uint64 author, uint64 n) public view returns(uint64) {
        return posts_by_author[author][n];
    }

    function migrate(address from_contract_address, uint64 id_from, uint64 id_to) public onlyOwner {
        require(amount_of_posts+1 == id_from, "cannot migrate: id_from != amount_of_posts+1");
        Old_Posts from_contract = Old_Posts(from_contract_address);
        for(uint64 id = id_from; id <= id_to; id++) {
            (string memory message, uint64 author, uint64 timestamp, uint64 space, uint64 mother_post) = from_contract.posts(id);
            if(author == 0) {
                break;
            }
            console.log("migrating post #%s", id);
            _add_post(space, author, timestamp, message, mother_post);
        }
    }
}

struct Post {
    string message;
    uint64 author;
    uint64 timestamp;
    uint64 space;
    uint64 mother_post;
    bool deleted;
}
