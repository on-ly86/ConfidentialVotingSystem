// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialVotingSystem is SepoliaConfig {
    // Encrypted vote options
    enum VoteOption { APPROVE, REJECT, ABSTAIN }
    uint8 constant OPTION_COUNT = 3;
    
    // Encrypted vote record
    struct EncryptedVote {
        euint32 encryptedChoice; // Encrypted vote choice
        euint32 encryptedWeight; // Encrypted voting weight (e.g., share count)
        uint256 timestamp;
        address voter; // For auditing purposes (stored encrypted in real implementation)
        bool isRevealed;
    }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        string descriptionHash; // Hash of proposal content (stored off-chain)
        uint256 startTime;
        uint256 endTime;
        euint32[OPTION_COUNT] encryptedVoteCounts; // Encrypted vote counts per option
        euint32 encryptedTotalWeight; // Encrypted total voting weight
        bool thresholdAlertTriggered;
        bool isFinalized;
    }
    
    // Audit log with ZK proof
    struct AuditLog {
        uint256 proposalId;
        bytes32 operationHash;
        bytes zkProof;
        uint256 timestamp;
    }

    // Contract state
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => EncryptedVote)) public encryptedVotes;
    AuditLog[] public auditLogs;
    
    // Encrypted threshold alert system
    euint32 private encryptedAlertThreshold; // Encrypted alert threshold (percentage)
    bool public globalAlertStatus;
    
    // Access control
    address public admin;
    mapping(address => bool) public auditors;
    
    // Events
    event ProposalCreated(uint256 indexed id, string descriptionHash);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event VoteRevealed(uint256 indexed proposalId, address indexed voter);
    event ThresholdAlert(uint256 indexed proposalId, euint32 encryptedAgainstCount);
    event ProposalFinalized(uint256 indexed proposalId);
    event AuditLogAdded(uint256 indexed logId, bytes32 operationHash);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Unauthorized");
        _;
    }
    
    modifier onlyAuditor() {
        require(auditors[msg.sender], "Not auditor");
        _;
    }
    
    modifier votingOpen(uint256 proposalId) {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "Voting closed");
        require(!p.isFinalized, "Proposal finalized");
        _;
    }

    constructor(euint32 _encryptedThreshold) {
        admin = msg.sender;
        encryptedAlertThreshold = _encryptedThreshold;
        globalAlertStatus = false;
    }
    
    /// @notice Create a new proposal
    function createProposal(
        string memory _descriptionHash,
        uint256 _duration
    ) public onlyAdmin {
        proposalCount++;
        uint256 newId = proposalCount;
        
        // Initialize encrypted vote counts
        euint32[OPTION_COUNT] memory initialCounts;
        for (uint8 i = 0; i < OPTION_COUNT; i++) {
            initialCounts[i] = FHE.asEuint32(0);
        }
        
        proposals[newId] = Proposal({
            id: newId,
            descriptionHash: _descriptionHash,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            encryptedVoteCounts: initialCounts,
            encryptedTotalWeight: FHE.asEuint32(0),
            thresholdAlertTriggered: false,
            isFinalized: false
        });
        
        emit ProposalCreated(newId, _descriptionHash);
    }
    
    /// @notice Submit an encrypted vote
    function castEncryptedVote(
        uint256 proposalId,
        euint32 _encryptedChoice,
        euint32 _encryptedWeight
    ) public votingOpen(proposalId) {
        require(!encryptedVotes[proposalId][msg.sender].isRevealed, "Already voted");
        
        EncryptedVote memory newVote = EncryptedVote({
            encryptedChoice: _encryptedChoice,
            encryptedWeight: _encryptedWeight,
            timestamp: block.timestamp,
            voter: msg.sender,
            isRevealed: false
        });
        
        encryptedVotes[proposalId][msg.sender] = newVote;
        emit VoteCast(proposalId, msg.sender);
    }
    
    /// @notice Process vote (aggregation + threshold check)
    function processVote(
        uint256 proposalId,
        address voter
    ) internal {
        Proposal storage p = proposals[proposalId];
        EncryptedVote storage v = encryptedVotes[proposalId][voter];
        
        // Validate vote using FHE selectors
        ebool isValid = FHE.ne(v.encryptedChoice, FHE.asEuint32(uint32(-1)));
        require(FHE.decrypt(isValid), "Invalid vote");
        
        // Update option counts
        for (uint8 i = 0; i < OPTION_COUNT; i++) {
            ebool isOption = FHE.eq(v.encryptedChoice, FHE.asEuint32(i));
            euint32 addedWeight = FHE.cmux(isOption, v.encryptedWeight, FHE.asEuint32(0));
            p.encryptedVoteCounts[i] = FHE.add(p.encryptedVoteCounts[i], addedWeight);
        }
        
        // Update total weight
        p.encryptedTotalWeight = FHE.add(p.encryptedTotalWeight, v.encryptedWeight);
        
        // Threshold alert check (REJECT votes exceeding threshold)
        euint32 rejectCount = p.encryptedVoteCounts[uint8(VoteOption.REJECT)];
        euint32 thresholdWeight = FHE.mul(p.encryptedTotalWeight, encryptedAlertThreshold);
        ebool alertCondition = FHE.gt(rejectCount, thresholdWeight);
        
        // Trigger alert if condition met
        if (!p.thresholdAlertTriggered && FHE.decrypt(alertCondition)) {
            p.thresholdAlertTriggered = true;
            globalAlertStatus = true;
            emit ThresholdAlert(proposalId, rejectCount);
        }
        
        v.isRevealed = true;
        emit VoteRevealed(proposalId, voter);
    }
    
    /// @notice Finalize proposal (admin only)
    function finalizeProposal(uint256 proposalId) public onlyAdmin {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp > p.endTime, "Voting ongoing");
        require(!p.isFinalized, "Already finalized");
        
        p.isFinalized = true;
        emit ProposalFinalized(proposalId);
        
        // Add audit log
        _addAuditLog(
            proposalId,
            "FINALIZE_RESULTS",
            abi.encodePacked(p.encryptedVoteCounts, p.encryptedTotalWeight)
        );
    }
    
    /// @notice Add audit log with ZK proof placeholder
    function _addAuditLog(
        uint256 proposalId,
        string memory operation,
        bytes memory encryptedData
    ) internal {
        bytes32 opHash = keccak256(abi.encodePacked(operation, encryptedData));
        auditLogs.push(AuditLog({
            proposalId: proposalId,
            operationHash: opHash,
            zkProof: new bytes(0), // To be populated with actual ZK proof
            timestamp: block.timestamp
        }));
        emit AuditLogAdded(auditLogs.length - 1, opHash);
    }
    
    /// @notice Verify audit log (simplified)
    function verifyAuditLog(uint256 logId) public view onlyAuditor returns (bool) {
        // In production, this would verify ZK proof
        return auditLogs[logId].zkProof.length > 0;
    }
    
    // === Admin Functions ===
    
    function setAuditor(address _auditor, bool _status) public onlyAdmin {
        auditors[_auditor] = _status;
    }
    
    function updateAlertThreshold(euint32 newThreshold) public onlyAdmin {
        encryptedAlertThreshold = newThreshold;
    }
    
    // === View Functions ===
    
    function getEncryptedResults(uint256 proposalId) public view returns (
        euint32[OPTION_COUNT] memory,
        euint32
    ) {
        Proposal storage p = proposals[proposalId];
        require(p.isFinalized, "Not finalized");
        return (p.encryptedVoteCounts, p.encryptedTotalWeight);
    }
    
    function getGlobalAlertStatus() public view onlyAdmin returns (bool) {
        return globalAlertStatus;
    }
}