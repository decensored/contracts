// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

import "./RateControl.sol";
import "./Tokens.sol";
import "./Accounts.sol";
import "./Spaces.sol";
import "./Posts.sol";
import "./Upvotes.sol";

contract Contracts is OwnableUpgradeable {

    RateControl public rate_control;
    Accounts public accounts;
    Tokens public tokens;
    Spaces public spaces;
    Posts public posts;
    Upvotes public upvotes;

    function initialize() public initializer  {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function set_rate_control(address address_rate_control) public onlyOwner {
        rate_control = RateControl(address_rate_control);
    }

    function set_accounts(address address_accounts) public onlyOwner {
        accounts = Accounts(address_accounts);
    }

    function set_tokens(address address_tokens) public onlyOwner {
        tokens = Tokens(address_tokens);
    }

    function set_spaces(address address_spaces) public onlyOwner {
        spaces = Spaces(address_spaces);
    }

    function set_posts(address address_posts) public onlyOwner {
        posts = Posts(address_posts);
    }

    function set_upvotes(address address_upvotes) public onlyOwner {
        upvotes = Upvotes(address_upvotes);
    }
}