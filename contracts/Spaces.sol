// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Contracts.sol";

contract Spaces is OwnableUpgradeable {

    Contracts public contracts;

    uint64 id_counter;

    mapping(uint64 => Space) public spaces;
    mapping(string => uint64) public id_by_name;
    mapping(uint128 => bool) private blacklist;

    function initialize(address contracts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        contracts = Contracts(contracts_address);
        id_counter = 0;
    }

    function get_latest_space_index() public view returns (uint64) {
        return id_counter;
    }

    function create(string calldata name, string calldata description, address nft_address) public {
        contracts.rate_control().perform_action(msg.sender);
        _require_legal_space_name(name);
        require(id_by_name[name] == 0, "cannot create space: a space with this name already exists");
        uint64 owner = contracts.accounts().id_by_address(msg.sender);
        _create(name, owner, description, nft_address);
    }

    function _create(string calldata name, uint64 owner, string calldata description, address nft_address) internal {
        uint64 id = ++id_counter;
        _require_legal_description(description);
        spaces[id] = Space(id, owner, name, description, nft_address);
        id_by_name[name] = id;
    }

    function set_description(uint64 space_id, string calldata description) public {
        _require_legal_description(description);
        
        uint64 account_sender = contracts.accounts().id_by_address(msg.sender);
        uint64 space_owner = spaces[space_id].owner;
        require(account_sender == space_owner, "cannot change description of space: you do not own the space");
        
        Space memory space = spaces[space_id];
        space.description = description;
        spaces[space_id] = space;
    }

    function add_account_to_blacklist(uint64 space, uint64 account) public {
        _set_blacklist_state(space, account, true);
    }

    function remove_account_from_blacklist(uint64 space, uint64 account) public {
        _set_blacklist_state(space, account, false);
    }

    function _set_blacklist_state(uint64 space, uint64 account, bool is_to_be_blacklisted) internal {
        contracts.rate_control().perform_action(msg.sender);
        uint64 account_sender = contracts.accounts().id_by_address(msg.sender);
        uint64 space_owner = spaces[space].owner;
        require(account_sender == space_owner, "cannot set membership for space: you do not own the space");
        uint128 space_account_id = _encode_two_uint64_as_uint128(space, account);
        blacklist[space_account_id] = is_to_be_blacklisted;
    }

    function is_blacklisted(uint64 space, uint64 account) public view returns(bool) {
        uint128 space_account_id = _encode_two_uint64_as_uint128(space, account);
        return blacklist[space_account_id];
    }

    function is_allowed(uint64 space, uint64 account) public view returns(bool) {
        Space memory _space = spaces[space];

        // Public space, allow access
        if(_space.nft_address == 0x0000000000000000000000000000000000000000) {
            return true;
        }

        ERC721 nft = ERC721(_space.nft_address);

        // Get account address  - msg.sender maybe has no nfts, but a linked account 
        address[] memory addresses = contracts.accounts().get_connected_addresses(account);

        uint256 ownerTokenCount = 0;
        for (uint256 i; i < addresses.length; i++) {
            ownerTokenCount += nft.balanceOf(addresses[i]);
        }

        if (ownerTokenCount > 0) {
            return true;
        } else {
            return false;
        }
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

    function _require_legal_description(string calldata description) private pure {
        int length = int(bytes(description).length);
        require(length < 200, "description must be 200 characters or less");
      }

    function is_number_within_range(int number, int min, int max) private pure returns(bool){
        return min < number && number < max;
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

struct Space {
    uint64 id;
    uint64 owner;
    string name;
    string description;
    address nft_address;
}