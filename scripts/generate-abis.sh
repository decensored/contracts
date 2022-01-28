#!/usr/bin/env bash

rm abis/*

npx solcjs --abi --include-path node_modules/ --base-path ./ ./contracts/Posts.sol -o abis

rm abis/@openzeppelin* abis/hardhat_console_sol_console.abi

mv abis/contracts_Accounts_sol_Accounts.abi       abis/contracts_Accounts_sol_Accounts.json
mv abis/contracts_Posts_sol_Posts.abi             abis/contracts_Posts_sol_Posts.json
mv abis/contracts_RateControl_sol_RateControl.abi abis/contracts_RateControl_sol_RateControl.json
mv abis/contracts_Spaces_sol_Spaces.abi           abis/contracts_Spaces_sol_Spaces.json

