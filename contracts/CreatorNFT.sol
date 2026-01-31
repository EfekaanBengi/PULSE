// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title CreatorNFT
 * @notice ERC-721 subscription NFT for creator content access
 * @dev Deployed via SubscriptionFactory for each creator
 */
contract CreatorNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public price;
    uint256 public maxSupply;
    uint256 public maxPerWallet;
    string public imageURI;

    uint256 private _tokenIdCounter;
    mapping(address => uint256) private _mintCount;

    error InsufficientPayment();
    error MaxSupplyReached();
    error WalletLimitReached();
    error TransferFailed();

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _price,
        uint256 _maxSupply,
        uint256 _maxPerWallet,
        string memory _imageURI,
        address _creator
    ) ERC721(_name, _symbol) Ownable(_creator) {
        price = _price;
        maxSupply = _maxSupply;
        maxPerWallet = _maxPerWallet;
        imageURI = _imageURI;
    }

    /**
     * @notice Mint a subscription NFT
     * @dev Requires exact or higher payment, sends funds directly to creator
     */
    function mint() external payable {
        if (msg.value < price) revert InsufficientPayment();
        if (_tokenIdCounter >= maxSupply) revert MaxSupplyReached();
        if (_mintCount[msg.sender] >= maxPerWallet) revert WalletLimitReached();

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mintCount[msg.sender]++;

        _safeMint(msg.sender, tokenId);

        // Send funds directly to creator (owner)
        (bool success, ) = owner().call{value: msg.value}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Check if a wallet has an active subscription
     * @param wallet Address to check
     * @return True if wallet owns at least one NFT
     */
    function hasSubscription(address wallet) external view returns (bool) {
        return balanceOf(wallet) > 0;
    }

    /**
     * @notice Get the number of NFTs minted by a wallet
     * @param wallet Address to check
     * @return Number of NFTs minted
     */
    function mintedBy(address wallet) external view returns (uint256) {
        return _mintCount[wallet];
    }

    /**
     * @notice Get the current total supply
     * @return Number of NFTs minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Returns on-chain JSON metadata for a token
     * @param tokenId Token ID to get metadata for
     * @return Base64 encoded JSON metadata URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory json = string(
            abi.encodePacked(
                '{"name":"', name(), ' #', tokenId.toString(),
                '","description":"Subscription NFT for exclusive content access",',
                '"image":"', imageURI,
                '","attributes":[{"trait_type":"Subscription","value":"Active"}]}'
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }
}
