#!/usr/bin/env bash

rm abis/*

npx solcjs --abi --include-path node_modules/ --base-path ./ ./contracts/Posts.sol -o abis

rm abis/@openzeppelin* abis/hardhat_console_sol_console.abi

mv abis/contracts_Accounts_sol_Accounts.abi       abis/ABI_Accounts.json
mv abis/contracts_Posts_sol_Posts.abi             abis/ABI_Posts.json
mv abis/contracts_RateControl_sol_RateControl.abi abis/ABI_RateControl.json
mv abis/contracts_Spaces_sol_Spaces.abi           abis/ABI_Spaces.json
mv abis/contracts_Contracts_sol_Contracts.abi     abis/ABI_Contracts.json
rm abis/contracts_Tokens_sol_Tokens.abi
