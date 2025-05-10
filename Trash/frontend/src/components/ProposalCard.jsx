import React from 'react';
import { ethers } from 'ethers';

const ProposalCard = ({ proposal, account, threshold, onConfirm, onExecute }) => {
  const isProposer = proposal.proposer === account;
  const canExecute = proposal.confirmationCount >= threshold && !proposal.executed;
  const isExecuted = proposal.executed;
  const isConfirmed = proposal.confirmationCount > 0;

  return (
    <div className={`proposal-card ${isExecuted ? 'executed' : ''}`}>
      <div className="proposal-header">
        <h3>{proposal.description || 'Transfer Proposal'}</h3>
        <span className={`status-badge ${isExecuted ? 'executed' : 'pending'}`}>
          {isExecuted ? 'Executed' : 'Pending'}
        </span>
      </div>
      
      <div className="proposal-details">
        <p><strong>Recipient:</strong> {proposal.recipient}</p>
        <p><strong>Amount:</strong> {ethers.utils.formatEther(proposal.amount)} ETH</p>
        <p><strong>Confirmations:</strong> {proposal.confirmationCount}/{threshold}</p>
        <p><strong>Proposer:</strong> {isProposer ? 'You' : proposal.proposer}</p>
      </div>

      <div className="proposal-actions">
        {!isExecuted && (
          <>
            {!isProposer && (
              <button 
                className="btn-confirm"
                onClick={onConfirm}
              >
                Confirm
              </button>
            )}
            {canExecute && (
              <button 
                className="btn-execute"
                onClick={onExecute}
              >
                Execute
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;