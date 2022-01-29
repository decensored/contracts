// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract Tokens is OwnableUpgradeable {

    mapping(bytes32 => bool) private token_hashes;

    function initialize() public initializer  {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function use_token(string calldata token) public {
        bytes memory bytes_token = bytes(token);
        bytes32 token_hash = sha256(bytes_token);
        require(token_hashes[token_hash], "invalid token (has it been used before?)");
        token_hashes[token_hash] = false;
    }

    function add_token_hash(bytes32 token_hash) public onlyOwner {
        token_hashes[token_hash] = true;
    }
}