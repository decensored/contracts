// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Contracts.sol";

contract DAO is OwnableUpgradeable {

    Contracts public contracts;
    Proposal[] public proposals;

    mapping(uint64 => uint64) public voting_weight_by_account;
    mapping(uint128 => int64) public vote_by_proposal_and_account;

    function initialize(address contracts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        proposals.push(Proposal(0, "", "", 0, 0, 0));
        contracts = Contracts(contracts_address);
    }

    function set_voting_weight(uint64 account_id, uint64 voting_weight) public onlyOwner {
        voting_weight_by_account[account_id] = voting_weight;
    }

    function propose(string memory title, string memory description, uint64 deadline) public {
        uint64 proposer = contracts.accounts().id_by_address(msg.sender);
        require(proposer > 0, "cannot submit proposal: you are not signed in");
        require(deadline > uint64(block.timestamp) + 24*3600, "cannot submit proposal: deadline needs to be at least 24h in the future");
        contracts.rate_control().perform_action(msg.sender);
        Proposal memory proposal = Proposal(proposer, title, description, deadline, 0, 0);
        proposals.push(proposal);
    }

    function vote(uint64 proposal_id, int8 vote_value) public {
        require(-1 <= vote_value && vote_value <= 1, "cannot vote: invalid vote value (must be -1, 0 or 1)");
        uint64 account_id = contracts.accounts().id_by_address(msg.sender);
        uint128 proposal_and_account = _encode_two_uint64_as_uint128(proposal_id, account_id);
        int64 weighted_vote = vote_value * int64(voting_weight_by_account[account_id]);
        contracts.rate_control().perform_action(msg.sender);

        Proposal storage proposal = proposals[proposal_id];
        require(proposal.deadline >= uint64(block.timestamp), "cannot vote: voting period has already ended");
        
        int64 weighted_vote_diff = weighted_vote-vote_by_proposal_and_account[proposal_and_account];
        int64 weighted_vote_diff_abs = abs(weighted_vote)-abs(vote_by_proposal_and_account[proposal_and_account]);
        vote_by_proposal_and_account[proposal_and_account] += weighted_vote_diff;
        proposal.weighted_votes_sum += weighted_vote_diff;
        proposal.weighted_votes_abs = uint64(int64(proposal.weighted_votes_abs) + weighted_vote_diff_abs);
    }

    function _encode_two_uint64_as_uint128(uint64 a, uint64 b) public pure returns(uint128) {
        return uint128(a) * uint128(2**64-1) + uint128(b);
    }

    function abs(int64 x) private pure returns (int64) {
        return x >= 0 ? x : -x;
    }
}

struct Proposal {
    uint64 proposer;
    string title;
    string description;
    uint64 deadline;
    int64 weighted_votes_sum;
    uint64 weighted_votes_abs;
}