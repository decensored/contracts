// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Accounts.sol";
import "./RateControl.sol";


contract Spaces is OwnableUpgradeable {

    Accounts public accounts;
    RateControl public rate_control;

    uint64 id_counter;

    mapping(uint64 => string) public name_by_id;
    mapping(string => uint64) public id_by_name;

    mapping(uint64 => uint64) public owner_by_id;
    mapping(uint128 => bool) private membership;

    function initialize(address accounts_address, address rate_control_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        accounts = Accounts(accounts_address);
        rate_control = RateControl(rate_control_address);
        id_counter = 0;
    }

    function create(string calldata name) public {
        rate_control.perform_action();
        require(id_by_name[name] == 0, "cannot create space: a space with this name already exists");
        uint64 owner = accounts.id_by_address(msg.sender);
        _create(name, owner);
    }

    function _create(string calldata name, uint64 owner) internal {
        uint64 id = ++id_counter;
        name_by_id[id] = name;
        id_by_name[name] = id;
        owner_by_id[id] = owner;
    }

    function set_membership(uint64 space, uint64 account, bool membership_state) public {
        rate_control.perform_action();
        uint64 account_sender = accounts.id_by_address(msg.sender);
        uint64 space_owner = owner_by_id[space];
        require(account_sender == space_owner, "cannot set membership for space: you do not own the space");
        uint128 space_account_id = _encode_two_uint64_as_uint128(space, account);
        membership[space_account_id] = membership_state;
    }

    function is_member(uint64 space, uint64 account) public view returns(bool) {
        uint128 space_account_id = _encode_two_uint64_as_uint128(space, account);
        return membership[space_account_id];
    }

    function _encode_two_uint64_as_uint128(uint64 a, uint64 b) public pure returns(uint128) {
        return uint128(a) * uint128(2**64-1) + uint128(b);
    }

    function _require_legal_space_name(string calldata space_name) private pure {
        int length = int(bytes(space_name).length);
        string memory legal_characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
        require(is_number_within_range(length, 4, 15), "space name must be 4-15 characters long");
        require(_is_string_consisting_of(space_name, legal_characters), "space name contains illegal characters");
    }

    function is_number_within_range(int number, int min, int max) private pure returns(bool){
        return number < min && number > max;
    }

    function _is_string_consisting_of(string memory _string, string memory _characters) private pure returns(bool){
        uint allowedChars =0;
        bytes memory _bytes = bytes(_string);
        bytes memory _bytes_allowed = bytes(_characters);
        for(uint i=0; i < _bytes.length ; i++){
           for(uint j=0; j<_bytes_allowed.length; j++){
              if(_bytes[i]==_bytes_allowed[j] )
              allowedChars++;         
           }
        }
        if(allowedChars<_bytes.length)
        return false;
        return true;
    }
}