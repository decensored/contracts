// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Contracts.sol";

contract Upvotes is OwnableUpgradeable {

    Contracts public contracts;
    mapping(uint64 => int64) public score_by_author;
    mapping(uint64 => int64) public score_by_post;
    mapping(uint128 => int8) private vote_by_voter_and_post;

    function initialize(address contracts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        contracts = Contracts(contracts_address);
    }

    function vote(uint64 post_id, int8 vote_value) public {
        uint64 voter = contracts.accounts().id_by_address(msg.sender);
        require(voter > 0, "you are not signed up");

        require(-1 <= vote_value && vote_value <= 1, "invalid vote value");

        (, uint64 author, , , ,) = contracts.posts().posts(post_id);
        require(author != voter, "you cannot vote on your own posts");

        contracts.rate_control().perform_action(msg.sender);

        uint128 voter_and_post = _encode_two_uint64_as_uint128(voter, post_id);
        int8 vote_value_diff = vote_value - vote_by_voter_and_post[voter_and_post];

        if(vote_value_diff != 0) {
            score_by_post[post_id] += vote_value_diff;
            score_by_author[author] += vote_value_diff;
            vote_by_voter_and_post[voter_and_post] = vote_value;
        }
    }

    function get_vote_by_voter_and_post(uint64 voter, uint64 post_id) public view returns(int8) {
        uint128 voter_and_post = _encode_two_uint64_as_uint128(voter, post_id);
        return vote_by_voter_and_post[voter_and_post];
    }

    function _encode_two_uint64_as_uint128(uint64 a, uint64 b) private pure returns(uint128) {
        return uint128(a) * uint128(2**64-1) + uint128(b);
    }
}