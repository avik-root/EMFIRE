// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmfireGroup {
    // Events
    event GroupCreated(uint256 indexed groupId, address indexed creator, string name);
    event MemberAdded(uint256 indexed groupId, address indexed member);
    event MemberRemoved(uint256 indexed groupId, address indexed member);
    event MemberRequested(uint256 indexed groupId, address indexed member);
    event ProposalCreated(uint256 indexed groupId, uint256 indexed proposalId, address indexed proposer);
    event ProposalConfirmed(uint256 indexed groupId, uint256 indexed proposalId, address indexed confirmer);
    event ProposalExecuted(uint256 indexed groupId, uint256 indexed proposalId, address indexed executor);
    event ProposalCancelled(uint256 indexed groupId, uint256 indexed proposalId);
    event DepositMade(uint256 indexed groupId, address indexed depositor, uint256 amount);
    event WithdrawalMade(uint256 indexed groupId, address indexed recipient, uint256 amount);

    // Structs
    struct Group {
        address creator;
        string name;
        address[] members;
        uint256 threshold;
        uint256 balance;
        uint256 createdAt;
    }

    struct Proposal {
        address proposer;
        address payable recipient;
        uint256 amount;
        string description;
        bool executed;
        bool cancelled;
        uint256 confirmationCount;
        uint256 createdAt;
    }

    // State variables
    uint256 public groupCounter;
    mapping(uint256 => Group) public groups;
    mapping(uint256 => mapping(uint256 => Proposal)) public proposals;
    mapping(uint256 => uint256) public proposalCounters;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public confirmations;
    mapping(address => uint256) public userToGroup;
    mapping(uint256 => mapping(address => bool)) public pendingMembers;

    // Modifiers
    modifier onlyGroupMember(uint256 groupId) {
        require(isGroupMember(groupId, msg.sender), "Not a group member");
        _;
    }

    modifier onlyGroupCreator(uint256 groupId) {
        require(groups[groupId].creator == msg.sender, "Not group creator");
        _;
    }

    modifier validGroup(uint256 groupId) {
        require(groupId > 0 && groupId <= groupCounter, "Invalid group ID");
        _;
    }

    modifier validProposal(uint256 groupId, uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCounters[groupId], "Invalid proposal ID");
        _;
    }

    // Group Management Functions
    function createGroup(string memory name, address[] memory initialMembers) external {
        require(bytes(name).length > 0, "Group name required");
        require(initialMembers.length >= 1 && initialMembers.length <= 4, "2-5 members required");
        require(userToGroup[msg.sender] == 0, "Already in a group");

        uint256 groupId = ++groupCounter;
        groups[groupId] = Group({
            creator: msg.sender,
            name: name,
            members: initialMembers,
            threshold: (initialMembers.length + 1) / 2 + 1, // >50%
            balance: 0,
            createdAt: block.timestamp
        });

        // Add creator to members
        groups[groupId].members.push(msg.sender);
        userToGroup[msg.sender] = groupId;

        for (uint256 i = 0; i < initialMembers.length; i++) {
            address member = initialMembers[i];
            require(member != address(0), "Invalid member address");
            require(userToGroup[member] == 0, "Member already in a group");
            userToGroup[member] = groupId;
            emit MemberAdded(groupId, member);
        }

        emit GroupCreated(groupId, msg.sender, name);
    }

    function requestToJoinGroup(uint256 groupId) external validGroup(groupId) {
        require(userToGroup[msg.sender] == 0, "Already in a group");
        require(groups[groupId].members.length < 5, "Group is full");
        require(!isGroupMember(groupId, msg.sender), "Already member");
        require(!pendingMembers[groupId][msg.sender], "Request already pending");

        pendingMembers[groupId][msg.sender] = true;
        emit MemberRequested(groupId, msg.sender);
    }

    function approveMember(uint256 groupId, address newMember) external onlyGroupCreator(groupId) {
        require(pendingMembers[groupId][newMember], "No pending request");
        require(groups[groupId].members.length < 5, "Group is full");

        groups[groupId].members.push(newMember);
        userToGroup[newMember] = groupId;
        pendingMembers[groupId][newMember] = false;
        groups[groupId].threshold = (groups[groupId].members.length) / 2 + 1;
        
        emit MemberAdded(groupId, newMember);
    }

    function removeMember(uint256 groupId, address member) external onlyGroupCreator(groupId) {
        require(isGroupMember(groupId, member), "Not a group member");
        require(member != msg.sender, "Cannot remove yourself");
        require(groups[groupId].members.length > 2, "Group must have at least 2 members");

        for (uint256 i = 0; i < groups[groupId].members.length; i++) {
            if (groups[groupId].members[i] == member) {
                groups[groupId].members[i] = groups[groupId].members[groups[groupId].members.length - 1];
                groups[groupId].members.pop();
                userToGroup[member] = 0;
                groups[groupId].threshold = (groups[groupId].members.length) / 2 + 1;
                emit MemberRemoved(groupId, member);
                break;
            }
        }
    }

    // Wallet Functions
    function deposit(uint256 groupId) external payable onlyGroupMember(groupId) {
        require(msg.value > 0, "Must send ETH");
        groups[groupId].balance += msg.value;
        emit DepositMade(groupId, msg.sender, msg.value);
    }

    // Proposal Functions
    function createProposal(
        uint256 groupId,
        address payable recipient,
        uint256 amount,
        string memory description
    ) external onlyGroupMember(groupId) {
        require(amount <= groups[groupId].balance, "Insufficient group balance");
        require(recipient != address(0), "Invalid recipient");

        uint256 proposalId = ++proposalCounters[groupId];
        proposals[groupId][proposalId] = Proposal({
            proposer: msg.sender,
            recipient: recipient,
            amount: amount,
            description: description,
            executed: false,
            cancelled: false,
            confirmationCount: 1,
            createdAt: block.timestamp
        });

        confirmations[groupId][proposalId][msg.sender] = true;
        emit ProposalCreated(groupId, proposalId, msg.sender);
    }

    function confirmProposal(uint256 groupId, uint256 proposalId) 
        external 
        onlyGroupMember(groupId)
        validProposal(groupId, proposalId)
    {
        Proposal storage proposal = proposals[groupId][proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal was cancelled");
        require(!confirmations[groupId][proposalId][msg.sender], "Already confirmed");

        confirmations[groupId][proposalId][msg.sender] = true;
        proposal.confirmationCount++;
        emit ProposalConfirmed(groupId, proposalId, msg.sender);
    }

    function executeProposal(uint256 groupId, uint256 proposalId) 
        external 
        onlyGroupMember(groupId)
        validProposal(groupId, proposalId)
    {
        Proposal storage proposal = proposals[groupId][proposalId];
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal was cancelled");
        require(proposal.confirmationCount >= groups[groupId].threshold, "Not enough confirmations");

        proposal.executed = true;
        groups[groupId].balance -= proposal.amount;
        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        require(success, "Transfer failed");

        emit ProposalExecuted(groupId, proposalId, msg.sender);
        emit WithdrawalMade(groupId, proposal.recipient, proposal.amount);
    }

    function cancelProposal(uint256 groupId, uint256 proposalId) 
        external 
        onlyGroupMember(groupId)
        validProposal(groupId, proposalId)
    {
        Proposal storage proposal = proposals[groupId][proposalId];
        require(proposal.proposer == msg.sender, "Only proposer can cancel");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Already cancelled");

        proposal.cancelled = true;
        emit ProposalCancelled(groupId, proposalId);
    }

    // View Functions
    function isGroupMember(uint256 groupId, address member) public view returns (bool) {
        for (uint256 i = 0; i < groups[groupId].members.length; i++) {
            if (groups[groupId].members[i] == member) {
                return true;
            }
        }
        return false;
    }

    function getGroupMembers(uint256 groupId) external view returns (address[] memory) {
        return groups[groupId].members;
    }

    function getGroupProposals(uint256 groupId) external view returns (Proposal[] memory) {
        Proposal[] memory groupProposals = new Proposal[](proposalCounters[groupId]);
        for (uint256 i = 1; i <= proposalCounters[groupId]; i++) {
            groupProposals[i - 1] = proposals[groupId][i];
        }
        return groupProposals;
    }

    function getGroupDetails(uint256 groupId) external view returns (
        address creator,
        string memory name,
        uint256 memberCount,
        uint256 threshold,
        uint256 balance,
        uint256 createdAt
    ) {
        Group storage group = groups[groupId];
        return (
            group.creator,
            group.name,
            group.members.length,
            group.threshold,
            group.balance,
            group.createdAt
        );
    }

    function getProposalDetails(uint256 groupId, uint256 proposalId) external view returns (
        address proposer,
        address recipient,
        uint256 amount,
        string memory description,
        bool executed,
        bool cancelled,
        uint256 confirmationCount,
        uint256 createdAt
    ) {
        Proposal storage proposal = proposals[groupId][proposalId];
        return (
            proposal.proposer,
            proposal.recipient,
            proposal.amount,
            proposal.description,
            proposal.executed,
            proposal.cancelled,
            proposal.confirmationCount,
            proposal.createdAt
        );
    }

    function hasConfirmed(uint256 groupId, uint256 proposalId, address member) external view returns (bool) {
        return confirmations[groupId][proposalId][member];
    }

    function getPendingMembers(uint256 groupId) external view returns (address[] memory) {
        address[] memory pending = new address[](groups[groupId].members.length);
        uint256 count = 0;
        for (uint256 i = 0; i < groups[groupId].members.length; i++) {
            address member = groups[groupId].members[i];
            if (pendingMembers[groupId][member]) {
                pending[count] = member;
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pending[i];
        }
        return result;
    }

    // Fallback function to receive ETH
    receive() external payable {}
}