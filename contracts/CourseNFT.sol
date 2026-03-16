// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CourseNFT
 * @dev ERC-721 NFT contract for EIPsInsight Academy course certificates
 * 
 * Features:
 * - Mint NFT certificates with metadata URI
 * - Support for ENS names in metadata
 * - Burnable certificates (users can burn their own)
 * - Minter role for server-side minting
 * - URI storage for on-chain metadata
 */
contract CourseNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Minter role - address authorized to mint tokens
    mapping(address => bool) public minters;

    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event CertificateMinted(
        address indexed to,
        uint256 indexed tokenId,
        string ensName,
        string metadataURI
    );

    /**
     * @dev Initialize contract with name and symbol
     */
    constructor() ERC721("EIPsInsight Course Certificate", "EIPS-CERT") {
        // Add deployer as initial minter
        minters[msg.sender] = true;
        emit MinterAdded(msg.sender);
    }

    /**
     * @dev Add a minter address
     * @param _minter Address to be granted minter role
     */
    function addMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter address");
        require(!minters[_minter], "Address is already a minter");
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    /**
     * @dev Remove a minter address
     * @param _minter Address to have minter role removed
     */
    function removeMinter(address _minter) external onlyOwner {
        require(minters[_minter], "Address is not a minter");
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @dev Mint a new NFT certificate
     * @param to Address to receive the NFT
     * @param uri Metadata URI (IPFS, HTTP, etc.)
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri) external returns (uint256) {
        require(minters[msg.sender], "Only minters can call this function");
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(uri).length > 0, "URI cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit CertificateMinted(to, tokenId, "", uri);

        return tokenId;
    }

    /**
     * @dev Mint a certificate with ENS name annotation
     * @param to Address to receive the NFT
     * @param uri Metadata URI
     * @param ensName ENS name associated with the certificate (stored in event, not on-chain)
     * @return tokenId The ID of the newly minted token
     */
    function mintWithENS(
        address to,
        string memory uri,
        string memory ensName
    ) external returns (uint256) {
        require(minters[msg.sender], "Only minters can call this function");
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(uri).length > 0, "URI cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit CertificateMinted(to, tokenId, ensName, uri);

        return tokenId;
    }

    /**
     * @dev Get current token counter
     * @return Current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Check if address is a minter
     * @param _address Address to check
     * @return True if address is a minter
     */
    function isMinter(address _address) external view returns (bool) {
        return minters[_address];
    }

    // ============= Override functions =============

    /**
     * @dev See {ERC721-_burn}
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {ERC721-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {ERC721URIStorage-_setTokenURI}
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override(ERC721URIStorage) {
        super._setTokenURI(tokenId, _tokenURI);
    }
}
