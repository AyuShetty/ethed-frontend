// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Learning Buddy Manager
/// @notice Manages gamified AI pets (LearningBuddies) onchain
contract LearningBuddyManager {
    struct Buddy {
        uint256 id;
        string name;
        uint256 level;
        uint256 xp;
        string[] badges;
        address owner;
    }

    uint256 public buddyCount;
    mapping(uint256 => Buddy) public buddies;
    mapping(address => uint256[]) public ownerToBuddies;

    event BuddyCreated(uint256 indexed id, address indexed owner, string name);
    event LessonCompleted(uint256 indexed id, uint256 newLevel, uint256 newXp);
    event BadgeClaimed(uint256 indexed id, string badge);

    modifier onlyOwner(uint256 buddyId) {
        require(buddies[buddyId].owner == msg.sender, "Not your buddy");
        _;
    }

    function createBuddy(string memory name) external {
        uint256 buddyId = buddyCount++;
        Buddy storage newBuddy = buddies[buddyId];
        newBuddy.id = buddyId;
        newBuddy.name = name;
        newBuddy.level = 1;
        newBuddy.xp = 0;
        newBuddy.owner = msg.sender;

        ownerToBuddies[msg.sender].push(buddyId);

        emit BuddyCreated(buddyId, msg.sender, name);
    }

    function completeLesson(uint256 buddyId, uint256 xpGained) external onlyOwner(buddyId) {
        Buddy storage b = buddies[buddyId];
        b.xp += xpGained;
        if (b.xp >= b.level * 100) {
            b.level++;
            b.xp = 0;
        }
        emit LessonCompleted(buddyId, b.level, b.xp);
    }

    function claimBadge(uint256 buddyId, string memory badge) external onlyOwner(buddyId) {
        Buddy storage b = buddies[buddyId];
        b.badges.push(badge);
        emit BadgeClaimed(buddyId, badge);
    }

    function getBuddiesByOwner(address owner) external view returns (Buddy[] memory) {
        uint256[] memory ids = ownerToBuddies[owner];
        Buddy[] memory result = new Buddy[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = buddies[ids[i]];
        }
        return result;
    }
}
