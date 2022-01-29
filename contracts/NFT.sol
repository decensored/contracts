// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import "hardhat/console.sol";
import "base64-sol/base64.sol";

contract NFT is ERC721Upgradeable, OwnableUpgradeable {

    uint64 public token_counter;
    mapping (address => uint64) internal token_claims_by_address;
    mapping (uint64 => string) internal uri_by_id;

    event Minted(address indexed minter, uint64 indexed token_id);

    function initialize() public initializer  {
        __Context_init_unchained();
        __Ownable_init_unchained();
        token_counter = 0;
    }

    function mint() external {
        uint64 token_claims = token_claims_by_address[msg.sender];
        require(token_claims > 0, "Your address has no NFTs to claim.");
        token_claims_by_address[msg.sender] -= 1;

        string memory svg = '<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" /></svg>';
        string memory image_uri = generate_image_uri(svg);
        string memory token_uri = generate_token_uri(image_uri);

        token_counter = token_counter+1;
        _safeMint(msg.sender, token_counter);
        _setTokenUri(token_counter, token_uri);

        emit Minted(msg.sender, token_counter);
    }

    function generate_image_uri(string memory svg) public pure returns (string memory) {
        string memory base_url = "data:image/svg+xml;base64";
        string memory svg_base64 = string(Base64.encode(bytes(string(abi.encodePacked(svg)))));
        string memory image_uri = string(abi.encodePacked(base_url, svg_base64));
        return image_uri;
    }

    function generate_token_uri(string memory image_uri) public pure returns (string memory) {
        string memory base_url = "data:application/json;base64";
        return string(Base64.encode(
            bytes(abi.encodePacked(
                base_url, 
                '{"name": "Decensored NFT"',
                '"description":"Your Ticket to Web3"',
                '"attributes":""'
                '"image":"',image_uri,'"}')
            )
        )) ;
    }

    function set_claims_for_address(address _address, uint64 claims) public onlyOwner {
        token_claims_by_address[_address] = claims;
    }

    function tokenURI(uint256 _tokenId) public override view returns (string memory) {
        return _tokenURI(uint64(_tokenId));
    }

    function _tokenURI(uint64 _tokenId) internal virtual view returns (string memory) {
        return uri_by_id[_tokenId];
    }

    function _setTokenUri(uint64 _tokenId, string memory _uri) internal {
        uri_by_id[_tokenId] = _uri;
    }
}