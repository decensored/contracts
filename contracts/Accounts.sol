// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Contracts.sol";

contract Accounts is OwnableUpgradeable {

    Contracts public contracts;

    uint64 signup_counter;
    mapping(uint64 => Account) public accounts;
    mapping(address => uint64) public id_by_address;
    mapping(string => uint64) public id_by_username;

    event SignUp(uint64 indexed id, address indexed _address, string username);

    function initialize(address contracts_address) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        contracts = Contracts(contracts_address);
        signup_counter = 0;
    }

    function sign_up(string calldata username, string calldata token) public {
        
        contracts.tokens().use_token(token);
        
        address _address = msg.sender;
        _require_legal_username(username);
        require(id_by_address[_address] == 0, "cannot sign up: address already signed up");
        require(id_by_username[_string_to_lower(username)] == 0, "cannot sign up: username already in use");

        _sign_up(_address, username);
    }

    function _sign_up(address _address, string calldata username) internal {
        uint64 id = ++signup_counter;
        string memory username_lower = _string_to_lower(username);
        address[] memory empty_arr;
        accounts[id] = Account(username, "", "", _address, empty_arr, empty_arr);
        id_by_address[_address] = id;
        id_by_username[username_lower] = id;

        emit SignUp(id, _address, username);
    }

    function set_public_key(string calldata public_key) public {

        uint256 length = bytes(public_key).length;
        require(length == 128, "Cannot set public key: invalid length");

        contracts.rate_control().perform_action(msg.sender);

        uint64 id = id_by_address[msg.sender];
        Account memory account = accounts[id];
        account.public_key = public_key;
        accounts[id] = account;
    }

    function set_profile_picture(string calldata profile_picture) public {

        uint256 length = bytes(profile_picture).length;
        require(length > 256, "Cannot set profile picture: path too long");

        contracts.rate_control().perform_action(msg.sender);
        
        uint64 id = id_by_address[msg.sender];
        Account memory account = accounts[id];
        account.profile_picture = profile_picture;
        accounts[id] = account;
    }

    function _require_legal_username(string calldata username) private pure {
        int length = int(bytes(username).length);
        string memory legal_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIKLMNOPQRSTUVWXYZ0123456789_";
        require(_is_number_within_range(length, 4, 15), "username must be 4-15 characters long");
        require(_is_string_consisting_of(username, legal_characters), "username contains illegal characters");
    }

    function _is_number_within_range(int number, int min, int max) private pure returns(bool){
        return number >= min && number <= max;
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

    function _string_to_lower(string memory input) internal pure returns (string memory) {
        bytes memory bytes_input = bytes(input);
        bytes memory bytes_output = new bytes(bytes_input.length);
        for (uint i = 0; i < bytes_input.length; i++) {
            if ((uint8(bytes_input[i]) >= 65) && (uint8(bytes_input[i]) <= 90)) {
                bytes_output[i] = bytes1(uint8(bytes_input[i]) + 32);
            } else {
                bytes_output[i] = bytes_input[i];
            }
        }
        return string(bytes_output);
    }

    // This method adds and external wallet (metamask) address to an temporary array
    // The address needs to be veryfied by the metamask owner with the "validateExternAddress" function
    function addExternAddress(address metamask_address) public {
        require(metamask_address != msg.sender, "You need to send this message via decensored account");

        // add address to decensored account
        uint64 id = id_by_address[msg.sender];
        Account storage account = accounts[id];
         // TODO: Allow multiple unconnected_addresses
        account.unconnected_addresses[0] = msg.sender;
    }

    // This method gets called by metamask and adds the address to accounts connected_addresses
    function validateExternAddress(uint64 account_id) public {
        Account storage account = accounts[account_id];
        require(account._address != msg.sender, "You need to send this message via Metamask");

        for (uint256 i = 0; i < account.unconnected_addresses.length; i++) {
            if(account.unconnected_addresses[i] == msg.sender) {
                // TODO: Allow multiple connected_addresses
                account.connected_addresses[i] = msg.sender;
            }
        }
    }

    function get_connected_addresses(uint64 account_id) external view returns (address[] memory) {
        Account memory account = accounts[account_id];
        return account.connected_addresses;
    }
}

struct Account {
    string username;
    string public_key;
    string profile_picture;
    address _address;
    address[] connected_addresses;
    address[] unconnected_addresses;
}