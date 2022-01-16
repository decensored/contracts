// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract RateControl is OwnableUpgradeable {

    uint64 private interval;

    mapping(address => uint64) private actions_allowed_per_interval_by_address;
    mapping(address => uint64[]) private action_timestamps_by_address;

    function initialize() public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        interval = 20*60;
    }

    function set_account_rate_limit(address _address, uint64 actions_per_interval) public onlyOwner {
        actions_allowed_per_interval_by_address[_address] = actions_per_interval;
    }

    function perform_action() public {
        require(is_below_rate_limit(msg.sender), "you already reached your rate limit");
        action_timestamps_by_address[msg.sender].push(uint64(block.timestamp));
    }

    function is_below_rate_limit(address _address) public view returns(bool) {
        uint64 timestamp_now = uint64(block.timestamp);
        uint64 actions_performed_within_interval = 0;
        for(uint64 i = 0; i < action_timestamps_by_address[_address].length; i++) {
            uint64 timestamp_action = action_timestamps_by_address[_address][i];
            if(timestamp_action > timestamp_now - interval) {
                actions_performed_within_interval++;
            }
        }
        return actions_performed_within_interval < actions_allowed_per_interval_by_address[_address];
    }
}