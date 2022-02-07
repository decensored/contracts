// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./Contracts.sol";


contract Old_Posts is OwnableUpgradeable {

    mapping(uint64 => Old_Post) public posts;

    function initialize() public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }
}

struct Old_Post {
    string message;
    uint64 author;
    uint64 timestamp;
    uint64 space;
    uint64 mother_post;
}