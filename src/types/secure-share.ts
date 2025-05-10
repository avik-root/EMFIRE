export interface User {
  id: string;
  name: string;
  address: string; // Ethereum address
}

export interface Owner {
  address: string;
  // Optional: could link to a User.id if owners are also users in the system
  // userId?: string;
}

export interface Confirmation {
  ownerAddress: string;
  confirmedAt: Date;
}

export interface JoinRequest {
  userId: string;
  userName: string;
  userAddress: string;
  requestedAt: string; // Store as ISO string for easier serialization if needed
}

export interface Proposal {
  id: string; // Unique ID for the proposal (e.g., uint256 from contract, or UUID in mock)
  proposer: string; // Address of the owner who proposed
  to: string; // Target address for the transaction
  value: string; // Amount of ETH to send (as string to handle large numbers)
  data: string; // Calldata for contract interaction (hex string)
  executed: boolean;
  confirmations: Confirmation[];
  confirmationCount: number;
  aiRiskScore?: number | null; // Optional: AI assessed risk score (0-100)
  aiRiskFactors?: string; // Optional: Explanation for the risk score
  createdAt: Date;
  executedAt?: Date;
}

export interface MultiSigWallet {
  id: string; // Unique ID for the wallet (e.g., contract address or internal ID)
  name?: string; // Optional user-friendly name
  address: string; // Blockchain address of the multi-sig wallet
  owners: Owner[];
  threshold: number;
  proposals: Proposal[];
  createdAt: Date;
  balance: string; // Total balance of the wallet in ETH (as string)
  pendingJoinRequests?: JoinRequest[];
}

// For AI Risk Assessment flow
export type AssessTransactionRiskInput = {
  to: string;
  value: number; // ETH value as a number for the AI model
  data: string;
};

export type AssessTransactionRiskOutput = {
  riskScore: number;
  riskFactors: string;
};
