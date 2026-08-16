// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ZoraGenesisProof {
    address public immutable builder;
    string public constant projectName = "Zora Genesis";
    string public constant demoUrl = "https://zora-genesis-mygregoryfun-4145s-projects.vercel.app";
    string public constant buildPostUrl = "https://x.com/mygregoryfun/status/2088388638916694508";
    string public constant description = "AI agent for Base and Zora creator asset discovery.";

    event ProofCreated(
        address indexed builder,
        string projectName,
        string demoUrl,
        string buildPostUrl
    );

    constructor() {
        builder = msg.sender;
        emit ProofCreated(msg.sender, projectName, demoUrl, buildPostUrl);
    }
}
