// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ENS Registry Mock
/// @notice Simulates ENS subdomain assignment for users
contract ENSRegistryMock {
    mapping(address => string) public ensNames;

    event SubdomainAssigned(address indexed user, string ensName);

    function assignSubdomain(address user, string memory subdomain) external {
        string memory fullDomain = string(abi.encodePacked(subdomain, ".etheed.eth"));
        ensNames[user] = fullDomain;
        emit SubdomainAssigned(user, fullDomain);
    }

    function getSubdomain(address user) external view returns (string memory) {
        return ensNames[user];
    }
}
