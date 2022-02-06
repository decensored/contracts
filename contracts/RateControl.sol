// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract RateControl is OwnableUpgradeable {

    uint64 private interval;
    uint64 private default_rate;
    bool private rate_control_enabled;

    mapping(address => uint64) private rate_by_address;
    mapping(address => uint64[]) private action_timestamps_by_address;

    function initialize() public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        interval = 3*60;
        default_rate = 0;
        rate_control_enabled = true;
    }

    function set_rate(address _address, uint64 rate) public onlyOwner {
        rate_by_address[_address] = rate;
    }

    function set_rate_control_enabled(bool _rate_control_enabled) public onlyOwner {
        rate_control_enabled = _rate_control_enabled;
    }

    function set_default_rate(uint64 _default_rate) public onlyOwner {
        default_rate = _default_rate;
    }

    function set_interval(uint64 _interval) public onlyOwner {
        interval = _interval;
    }

    function perform_action(address _address) public {
        // TODO require msg.sender == one of the contracts
        require(is_below_rate_limit(_address), "you already reached your rate limit");
        prune_old_actions(_address);
        action_timestamps_by_address[_address].push(uint64(block.timestamp));
    }

    function prune_old_actions(address _address) internal {
        uint64 timestamp_now = uint64(block.timestamp);
        uint64 length = uint64(action_timestamps_by_address[_address].length);

        uint64 keep_from_index_onwards = 0;
        while(keep_from_index_onwards < length && action_timestamps_by_address[_address][keep_from_index_onwards] < timestamp_now - interval) {
            keep_from_index_onwards++;
        }
        
        uint64 new_length = length - keep_from_index_onwards;
        for(uint64 i = 0; i < new_length; i++) {
            action_timestamps_by_address[_address][i] = action_timestamps_by_address[_address][i + keep_from_index_onwards];
        }

        for(uint64 i = new_length; i < length; i++) {
            action_timestamps_by_address[_address].pop();
        }
    }

    function is_below_rate_limit(address _address) public view returns(bool) {

        if(!rate_control_enabled) {
            return true;
        }

        uint64 timestamp_now = uint64(block.timestamp);
        uint64 actions_performed_within_interval = 0;
        for(uint64 i = 0; i < action_timestamps_by_address[_address].length; i++) {
            uint64 timestamp_action = action_timestamps_by_address[_address][i];
            if(timestamp_action > timestamp_now - interval) {
                actions_performed_within_interval++;
            }
        }

        uint64 rate = rate_by_address[_address];
        if(rate == 0) {
            rate = default_rate;
        }

        return actions_performed_within_interval < rate;
    }
}