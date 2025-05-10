
import type { MultiSigWallet, Proposal, Owner, Confirmation, User, JoinRequest } from '@/types/secure-share';

const defaultMockUsers: User[] = [
  { id: 'user_alice', name: 'Alice', address: '0x1234567890123456789012345678901234567890' }, // Existing fixed address
  { id: 'user_bob', name: 'Bob', address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' },
  { id: 'user_charlie', name: 'Charlie', address: '0xfedcba9876543210fedcba9876543210fedcba98' },
  { id: 'user_dave', name: 'Dave (Not an Owner)', address: '0xd4veD4veD4veD4veD4veD4veD4veD4veD4ve01' },
  { id: 'user_oracle', name: 'AI Oracle', address: '0xOracleAddressOracleAddressOracleAddressOr' }, // AI Oracle address
];


const mockOwners: Owner[] = [
  { address: defaultMockUsers[0].address }, // Alice
  { address: defaultMockUsers[1].address }, // Bob
  { address: defaultMockUsers[2].address }, // Charlie
];


const mockProposals: Proposal[] = [
  {
    id: 'prop_1',
    proposer: mockOwners[0].address,
    to: '0xrecipient1Recipient1Recipient1Recipient1',
    value: '1.5', // ETH
    data: '0x', // Simple ETH transfer
    executed: false,
    confirmations: [{ ownerAddress: mockOwners[0].address, confirmedAt: new Date(Date.now() - 3600000) }],
    confirmationCount: 1,
    aiRiskScore: 15,
    aiRiskFactors: "Low value transfer to known address.",
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'prop_2',
    proposer: mockOwners[1].address,
    to: '0xcontractAddressContractAddressContractAdd',
    value: '0',
    data: '0xa9059cbb000000000000000000000000recipient2recipient2recipient2000000000000000000000000000000000000000000000000000000000000000a', // ERC20 transfer example
    executed: false,
    confirmations: [
        { ownerAddress: mockOwners[1].address, confirmedAt: new Date(Date.now() - 1800000) },
        { ownerAddress: mockOwners[0].address, confirmedAt: new Date(Date.now() - 600000) }
    ],
    confirmationCount: 2,
    aiRiskScore: 75,
    aiRiskFactors: "Interaction with a new contract, medium value tokens.",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'prop_3',
    proposer: mockOwners[0].address,
    to: '0xExchangeWalletExchangeWalletExchangeWall',
    value: '10', // ETH
    data: '0x',
    executed: true,
    confirmations: [
        { ownerAddress: mockOwners[0].address, confirmedAt: new Date(Date.now() - 86400000 * 2) },
        { ownerAddress: mockOwners[1].address, confirmedAt: new Date(Date.now() - 86400000 * 2 + 360000) },
        { ownerAddress: mockOwners[2].address, confirmedAt: new Date(Date.now() - 86400000 * 2 + 720000) }
    ],
    confirmationCount: 3,
    aiRiskScore: 5,
    aiRiskFactors: "Standard transfer to a whitelisted exchange.",
    createdAt: new Date(Date.now() - 86400000 * 2 - 3600000),
    executedAt: new Date(Date.now() - 86400000 * 2 + 1000000)
  },
];

const initialMockWallets: MultiSigWallet[] = [
  {
    id: 'wallet_1',
    name: 'Project Treasury',
    address: '0xMultiSigWallet1MultiSigWallet1MultiSigWa',
    owners: mockOwners,
    threshold: 2,
    proposals: mockProposals,
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    balance: '10.532', // ETH
    pendingJoinRequests: [
      { userId: 'user_dave', userName: 'Dave (Not an Owner)', userAddress: defaultMockUsers[3].address, requestedAt: new Date(Date.now() - 86400000).toISOString() }
    ],
  },
  {
    id: 'wallet_2',
    name: 'Personal Savings',
    address: '0xMyPersonalMultiSigMyPersonalMultiSigMyP',
    owners: [mockOwners[0], mockOwners[1]],
    threshold: 2,
    proposals: [
        {
            id: 'prop_personal_1',
            proposer: mockOwners[0].address,
            to: mockOwners[1].address,
            value: '0.1',
            data: '0x',
            executed: false,
            confirmations: [{ ownerAddress: mockOwners[0].address, confirmedAt: new Date() }],
            confirmationCount: 1,
            aiRiskScore: null,
            createdAt: new Date(),
        }
    ],
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    balance: '2.300', //ETH
    pendingJoinRequests: [],
  }
];

// Simulate a database or storage
let storedWallets: MultiSigWallet[];
let storedUsers: User[];

export const resetMockData = () => {
  storedUsers = JSON.parse(JSON.stringify(defaultMockUsers));
  storedWallets = JSON.parse(JSON.stringify(initialMockWallets));
};

if (typeof storedUsers === 'undefined' || typeof storedWallets === 'undefined') {
  resetMockData();
}

export const getUsers = async (): Promise<User[]> => {
  return Promise.resolve(JSON.parse(JSON.stringify(storedUsers)));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = storedUsers.find(u => u.id === id);
  return Promise.resolve(user ? JSON.parse(JSON.stringify(user)) : undefined);
};


export const getWallets = async (): Promise<MultiSigWallet[]> => {
  return Promise.resolve(JSON.parse(JSON.stringify(storedWallets)));
};

// Get wallets where a specific user is an owner
export const getWalletsForUser = async (userAddress: string): Promise<MultiSigWallet[]> => {
  const lowerUserAddress = userAddress.toLowerCase();
  const userWallets = storedWallets.filter(wallet => 
    wallet.owners.some(owner => owner.address.toLowerCase() === lowerUserAddress)
  );
  return Promise.resolve(JSON.parse(JSON.stringify(userWallets)));
};

export const getWalletById = async (id: string): Promise<MultiSigWallet | undefined> => {
  const wallet = storedWallets.find(wallet => wallet.id === id);
  return Promise.resolve(wallet ? JSON.parse(JSON.stringify(wallet)) : undefined);
};

export const createWallet = async (name: string, ownersStrings: string[], threshold: number, creator: User): Promise<MultiSigWallet> => {
  const newWalletId = `wallet_${Date.now()}`;
  const newWalletAddress = `0xMock${Date.now().toString().slice(-10)}`; 
  
  const initialOwnersSet = new Set<string>(ownersStrings.map(addr => addr.trim().toLowerCase()).filter(addr => addr.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(addr)));
  // Ensure creator is an owner
  initialOwnersSet.add(creator.address.toLowerCase());

  const validOwners: Owner[] = Array.from(initialOwnersSet).map(address => ({ address }));
  
  // Threshold cannot be more than number of owners, and must be at least 1 if there are owners.
  let newThreshold = threshold;
  if (validOwners.length > 0) {
    if (newThreshold > validOwners.length) newThreshold = validOwners.length;
    if (newThreshold < 1) newThreshold = 1;
  } else {
    newThreshold = 0; // No owners, threshold is 0
  }


  const newWallet: MultiSigWallet = {
    id: newWalletId,
    name,
    address: newWalletAddress,
    owners: validOwners,
    threshold: newThreshold,
    proposals: [],
    createdAt: new Date(),
    balance: '0', 
    pendingJoinRequests: [],
  };
  storedWallets.push(newWallet);
  return Promise.resolve(JSON.parse(JSON.stringify(newWallet)));
};

export const addProposal = async (walletId: string, proposalData: Omit<Proposal, 'id' | 'confirmations' | 'confirmationCount' | 'executed' | 'createdAt' | 'aiRiskScore' | 'aiRiskFactors'>): Promise<Proposal | null> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return null;

  const newProposalId = `prop_${Date.now()}`;
  const newProposal: Proposal = {
    ...proposalData,
    id: newProposalId,
    executed: false,
    confirmations: [{ ownerAddress: proposalData.proposer, confirmedAt: new Date() }], 
    confirmationCount: 1,
    aiRiskScore: null, 
    aiRiskFactors: '',
    createdAt: new Date(),
  };
  wallet.proposals.unshift(newProposal); 
  return Promise.resolve(JSON.parse(JSON.stringify(newProposal)));
};

export const confirmProposal = async (walletId: string, proposalId: string, confirmerAddress: string): Promise<Proposal | null> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return null;
  const proposal = wallet.proposals.find(p => p.id === proposalId);
  if (!proposal || proposal.executed) return null;

  const alreadyConfirmed = proposal.confirmations.some(c => c.ownerAddress.toLowerCase() === confirmerAddress.toLowerCase());
  if (alreadyConfirmed) {
     return Promise.resolve(JSON.parse(JSON.stringify(proposal))); 
  }

  proposal.confirmations.push({ ownerAddress: confirmerAddress, confirmedAt: new Date() });
  proposal.confirmationCount = proposal.confirmations.length;
  return Promise.resolve(JSON.parse(JSON.stringify(proposal)));
};

export const executeProposal = async (walletId: string, proposalId: string, executorAddress: string): Promise<Proposal | null> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return null;
  const proposal = wallet.proposals.find(p => p.id === proposalId);

  if (!proposal || proposal.executed || proposal.confirmationCount < wallet.threshold) return null;

  if (parseFloat(proposal.value) > 0 && (proposal.data === '0x' || proposal.data === '')) {
    const currentBalance = parseFloat(wallet.balance);
    const transferValue = parseFloat(proposal.value);
    if (currentBalance >= transferValue) {
      wallet.balance = (currentBalance - transferValue).toFixed(Math.max(wallet.balance.split('.')[1]?.length || 0, proposal.value.split('.')[1]?.length || 0, 3));
    } else {
      // In a real scenario, this would fail. For mock, we'll allow execution but log.
      console.warn(`Mock execution: Wallet ${walletId} has insufficient balance (${wallet.balance} ETH) for proposal ${proposalId} requiring ${transferValue} ETH.`);
      // For mock, proceed with marking as executed, but real contract would prevent this.
    }
  }

  proposal.executed = true;
  proposal.executedAt = new Date();
  return Promise.resolve(JSON.parse(JSON.stringify(proposal)));
};

export const updateProposalRiskScore = async (walletId: string, proposalId: string, riskScore: number, riskFactors: string): Promise<Proposal | null> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return null;
  const proposal = wallet.proposals.find(p => p.id === proposalId);
  if (!proposal) return null;

  proposal.aiRiskScore = riskScore;
  proposal.aiRiskFactors = riskFactors;
  return Promise.resolve(JSON.parse(JSON.stringify(proposal)));
};

export const addFundsToWallet = async (walletId: string, amount: string): Promise<MultiSigWallet | null> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return null;

  const currentBalance = parseFloat(wallet.balance);
  const amountToAdd = parseFloat(amount);

  if (isNaN(amountToAdd) || amountToAdd <= 0) {
    return null;
  }
  
  const currentDecimals = (wallet.balance.split('.')[1] || '').length;
  const amountDecimals = (amount.split('.')[1] || '').length;
  const precision = Math.max(currentDecimals, amountDecimals, 3); 

  wallet.balance = (currentBalance + amountToAdd).toFixed(precision);
  
  return Promise.resolve(JSON.parse(JSON.stringify(wallet)));
};

export const leaveWallet = async (walletId: string, ownerAddressToRemove: string): Promise<MultiSigWallet | null> => {
  const walletIndex = storedWallets.findIndex(w => w.id === walletId);
  if (walletIndex === -1) return null;

  const wallet = storedWallets[walletIndex];
  const ownerIdx = wallet.owners.findIndex(o => o.address.toLowerCase() === ownerAddressToRemove.toLowerCase());

  if (ownerIdx === -1) {
    return null; 
  }

  wallet.owners.splice(ownerIdx, 1);

  if (wallet.owners.length === 0) {
    wallet.threshold = 0;
  } else if (wallet.threshold > wallet.owners.length) {
    wallet.threshold = wallet.owners.length;
  }
  
  wallet.proposals.forEach(proposal => {
    const initialConfirmationCount = proposal.confirmationCount;
    proposal.confirmations = proposal.confirmations.filter(conf => conf.ownerAddress.toLowerCase() !== ownerAddressToRemove.toLowerCase());
    proposal.confirmationCount = proposal.confirmations.length;
    if (proposal.confirmationCount < initialConfirmationCount && proposal.executed) {
      // This scenario (owner removed after execution, potentially invalidating it) is complex.
      // For mock, we might just log or ignore. A real contract would have fixed execution state.
      console.warn(`Owner ${ownerAddressToRemove} removed from wallet ${walletId} after proposal ${proposal.id} was executed. Confirmations reduced.`);
    }
  });

  storedWallets[walletIndex] = wallet;
  return Promise.resolve(JSON.parse(JSON.stringify(wallet)));
};


export const requestToJoinWallet = async (walletId: string, user: User): Promise<MultiSigWallet | { error: string }> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return { error: "Wallet not found." };

  if (wallet.owners.some(o => o.address.toLowerCase() === user.address.toLowerCase())) {
    return { error: "You are already an owner of this wallet." };
  }
  if (!wallet.pendingJoinRequests) {
    wallet.pendingJoinRequests = [];
  }
  if (wallet.pendingJoinRequests.some(req => req.userId === user.id)) {
    return { error: "You have already requested to join this wallet." };
  }

  wallet.pendingJoinRequests.push({
    userId: user.id,
    userName: user.name,
    userAddress: user.address,
    requestedAt: new Date().toISOString(),
  });
  return Promise.resolve(JSON.parse(JSON.stringify(wallet)));
};

export const approveJoinRequest = async (walletId: string, requestingUserId: string, approverUser: User): Promise<MultiSigWallet | { error: string }> => {
  const wallet = storedWallets.find(w => w.id === walletId);
  if (!wallet) return { error: "Wallet not found." };

  if (!wallet.owners.some(o => o.address.toLowerCase() === approverUser.address.toLowerCase())) {
    return { error: "Only existing owners can approve join requests." };
  }

  if (!wallet.pendingJoinRequests) {
    return { error: "No pending join requests for this wallet." };
  }

  const requestIndex = wallet.pendingJoinRequests.findIndex(req => req.userId === requestingUserId);
  if (requestIndex === -1) {
    return { error: "Join request not found." };
  }

  const request = wallet.pendingJoinRequests[requestIndex];
  if (wallet.owners.some(o => o.address.toLowerCase() === request.userAddress.toLowerCase())) {
    wallet.pendingJoinRequests.splice(requestIndex, 1); // Clean up if already an owner somehow
    return { error: "User is already an owner." };
  }
  
  wallet.owners.push({ address: request.userAddress });
  wallet.pendingJoinRequests.splice(requestIndex, 1);

  // Optionally adjust threshold, or leave it to manual adjustment
  // For simplicity, not auto-adjusting threshold here.

  return Promise.resolve(JSON.parse(JSON.stringify(wallet)));
};

export const denyJoinRequest = async (walletId: string, requestingUserId: string, approverUser: User): Promise<MultiSigWallet | { error: string }> => {
    const wallet = storedWallets.find(w => w.id === walletId);
    if (!wallet) return { error: "Wallet not found." };

    if (!wallet.owners.some(o => o.address.toLowerCase() === approverUser.address.toLowerCase())) {
        return { error: "Only existing owners can deny join requests." };
    }

    if (!wallet.pendingJoinRequests) {
        return { error: "No pending join requests for this wallet." };
    }
    
    const requestIndex = wallet.pendingJoinRequests.findIndex(req => req.userId === requestingUserId);
    if (requestIndex === -1) {
        return { error: "Join request not found." };
    }

    wallet.pendingJoinRequests.splice(requestIndex, 1);
    return Promise.resolve(JSON.parse(JSON.stringify(wallet)));
};
