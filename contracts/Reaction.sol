// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Accounts.sol";
import "./Posts.sol";


contract Reaction is OwnableUpgradeable {

    Accounts public accounts;
    Posts public posts;

    mapping(uint128 => uint8) private reactions;

    function initialize(address accounts_posts) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        posts = Posts(accounts_posts);
        accounts = posts.accounts();
    }

    function _encode_two_uint64_as_uint128(uint64 a, uint64 b) internal pure returns(uint128) {
        return uint128(a) * uint128(2**64-1) + uint128(b);
    }

    function set_reaction(uint64 post, uint8 reaction) public {
        uint64 account = accounts.id_by_address(msg.sender);
        uint128 index = _encode_two_uint64_as_uint128(post, account);
        reactions[index] = reaction;
    }

    function get_reaction(uint64 post, uint64 account) public view returns (uint8) {
        uint128 index = _encode_two_uint64_as_uint128(post, account);
        return reactions[index];
    }
}