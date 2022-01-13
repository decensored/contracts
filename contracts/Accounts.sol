// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract Accounts is OwnableUpgradeable {

    uint64 signup_counter;
    mapping(uint64 => address) public address_by_id;
    mapping(uint64 => string) public username_by_id;
    mapping(address => uint64) public id_by_address;
    mapping(string => uint64) public id_by_username;

    event SignUp(uint64 indexed id, address indexed _address, string username);

    function initialize() public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        signup_counter = 0;
    }

    function sign_up(string calldata username) public {
        address _address = msg.sender;
        _require_legal_username(username);
        require(id_by_address[_address] == 0, "cannot sign up: address already signed up");
        require(id_by_username[username] == 0, "cannot sign up: username already in use");

        _sign_up(_address, username);
    }

    function _sign_up(address _address, string calldata username) internal {
        uint64 id = ++signup_counter;

        address_by_id[id] = _address;
        username_by_id[id] = username;
        id_by_address[_address] = id;
        id_by_username[username] = id;

        emit SignUp(id, _address, username);
    }

    function _require_legal_username(string calldata username) private pure {
        int length = int(bytes(username).length);
        string memory legal_characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
        require(is_number_within_range(length, 4, 15), "username must be 4-15 characters long");
        require(_is_string_consisting_of(username, legal_characters), "username contains illegal characters");
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