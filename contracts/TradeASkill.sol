// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TradeASkill {
    uint256 public nextCardId = 1;

    struct SkillCard {
        address maker;
        string offerSkill;
        string wantSkill;
        string format;
        string timeWindow;
        string note;
        uint256 createdAt;
    }

    mapping(uint256 => SkillCard) private cards;

    event CardPosted(
        uint256 indexed cardId,
        address indexed maker,
        string offerSkill,
        string wantSkill,
        string format
    );

    function postCard(
        string calldata offerSkill,
        string calldata wantSkill,
        string calldata format,
        string calldata timeWindow,
        string calldata note
    ) external returns (uint256 cardId) {
        require(bytes(offerSkill).length > 0 && bytes(offerSkill).length <= 42, "Invalid offer");
        require(bytes(wantSkill).length > 0 && bytes(wantSkill).length <= 42, "Invalid want");
        require(bytes(format).length > 0 && bytes(format).length <= 24, "Invalid format");
        require(bytes(timeWindow).length > 0 && bytes(timeWindow).length <= 28, "Invalid time");
        require(bytes(note).length > 0 && bytes(note).length <= 180, "Invalid note");

        cardId = nextCardId++;
        cards[cardId] = SkillCard({
            maker: msg.sender,
            offerSkill: offerSkill,
            wantSkill: wantSkill,
            format: format,
            timeWindow: timeWindow,
            note: note,
            createdAt: block.timestamp
        });

        emit CardPosted(cardId, msg.sender, offerSkill, wantSkill, format);
    }

    function getCard(
        uint256 cardId
    )
        external
        view
        returns (
            address maker,
            string memory offerSkill,
            string memory wantSkill,
            string memory format,
            string memory timeWindow,
            string memory note,
            uint256 createdAt
        )
    {
        SkillCard storage entry = cards[cardId];
        return (
            entry.maker,
            entry.offerSkill,
            entry.wantSkill,
            entry.format,
            entry.timeWindow,
            entry.note,
            entry.createdAt
        );
    }
}
