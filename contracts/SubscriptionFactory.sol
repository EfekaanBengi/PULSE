// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreatorNFT.sol";

/**
 * @title SubscriptionFactory
 * @notice Factory contract to deploy CreatorNFT contracts for each creator
 */
contract SubscriptionFactory {
    /// @notice Emitted when a new CreatorNFT is deployed
    event CreatorTokenDeployed(
        address indexed creator,
        address indexed contractAddress,
        string name,
        string symbol,
        uint256 price,
        uint256 maxSupply
    );

    /// @notice Mapping of creator address to their deployed contracts
    mapping(address => address[]) public creatorContracts;

    /// @notice Get all contracts deployed by a creator
    function getCreatorContracts(address creator) external view returns (address[] memory) {
        return creatorContracts[creator];
    }

    /**
     * @notice Deploy a new CreatorNFT contract
     * @param _name NFT collection name
     * @param _symbol NFT collection symbol
     * @param _price Mint price in wei
     * @param _maxSupply Maximum number of NFTs that can be minted
     * @param _maxPerWallet Maximum NFTs per wallet
     * @param _imageURI URI for the NFT image
     * @return Address of the deployed CreatorNFT contract
     */
    function deployCreatorToken(
        string calldata _name,
        string calldata _symbol,
        uint256 _price,
        uint256 _maxSupply,
        uint256 _maxPerWallet,
        string calldata _imageURI
    ) external returns (address) {
        CreatorNFT newContract = new CreatorNFT(
            _name,
            _symbol,
            _price,
            _maxSupply,
            _maxPerWallet,
            _imageURI,
            msg.sender
        );

        address contractAddress = address(newContract);
        creatorContracts[msg.sender].push(contractAddress);

        emit CreatorTokenDeployed(
            msg.sender,
            contractAddress,
            _name,
            _symbol,
            _price,
            _maxSupply
        );

        return contractAddress;
    }
}
