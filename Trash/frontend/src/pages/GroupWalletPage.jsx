import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import GroupDetailsCard from '../components/GroupDetailsCard';
import ProposalCard from '../components/ProposalCard';
import HistoryCard from '../components/HistoryCard';
import DepositModal from '../components/DepositModal';
import CreateProposalModal from '../components/CreateProposalModal';

function GroupWalletPage({ account, contract, provider, user }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [history, setHistory] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.currentGroup) {
      navigate('/');
      return;
    }

    const fetchGroupData = async () => {
      try {
        setLoading(true);
        
        // Fetch on-chain data
        const groupId = user.currentGroup.groupId;
        const [details, proposalList] = await Promise.all([
          contract.getGroupDetails(groupId),
          contract.getGroupProposals(groupId)
        ]);

        // Fetch off-chain data
        const res = await axios.get(`/api/groups/${user.currentGroup._id}`);
        
        setGroupDetails({
          ...details,
          name: res.data.name,
          members: res.data.members
        });
        
        setProposals(proposalList.filter(p => p.proposer !== ethers.constants.AddressZero));
        setHistory([]); // Would fetch from backend in a real app
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError('Failed to load group data');
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [user, contract, navigate]);

  const handleDeposit = async (amount) => {
    try {
      const tx = await contract.deposit(user.currentGroup.groupId, {
        value: ethers.utils.parseEther(amount.toString())
      });
      await tx.wait();
      // Refresh data
      const groupId = user.currentGroup.groupId;
      const updatedDetails = await contract.getGroupDetails(groupId);
      setGroupDetails(prev => ({ ...prev, balance: updatedDetails.balance }));
      setShowDepositModal(false);
    } catch (err) {
      console.error("Error depositing funds:", err);
      setError('Deposit failed');
    }
  };

  const handleCreateProposal = async (recipient, amount, description) => {
    try {
      const tx = await contract.createProposal(
        user.currentGroup.groupId,
        recipient,
        ethers.utils.parseEther(amount.toString()),
        description
      );
      await tx.wait();
      // Refresh proposals
      const updatedProposals = await contract.getGroupProposals(user.currentGroup.groupId);
      setProposals(updatedProposals.filter(p => p.proposer !== ethers.constants.AddressZero));
      setShowProposalModal(false);
    } catch (err) {
      console.error("Error creating proposal:", err);
      setError('Failed to create proposal');
    }
  };

  const handleConfirmProposal = async (proposalId) => {
    try {
      const tx = await contract.confirmProposal(user.currentGroup.groupId, proposalId);
      await tx.wait();
      // Refresh proposals
      const updatedProposals = await contract.getGroupProposals(user.currentGroup.groupId);
      setProposals(updatedProposals.filter(p => p.proposer !== ethers.constants.AddressZero));
    } catch (err) {
      console.error("Error confirming proposal:", err);
      setError('Failed to confirm proposal');
    }
  };

  const handleExecuteProposal = async (proposalId) => {
    try {
      const tx = await contract.executeProposal(user.currentGroup.groupId, proposalId);
      await tx.wait();
      // Refresh data
      const groupId = user.currentGroup.groupId;
      const [updatedDetails, updatedProposals] = await Promise.all([
        contract.getGroupDetails(groupId),
        contract.getGroupProposals(groupId)
      ]);
      setGroupDetails(prev => ({ ...prev, balance: updatedDetails.balance }));
      setProposals(updatedProposals.filter(p => p.proposer !== ethers.constants.AddressZero));
    } catch (err) {
      console.error("Error executing proposal:", err);
      setError('Failed to execute proposal');
    }
  };

  if (loading) {
    return <div className="loading">Loading group wallet...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="group-wallet-page">
      <h1>{groupDetails?.name || 'Group Wallet'}</h1>
      
      <div className="wallet-container">
        <div className="wallet-section">
          <GroupDetailsCard 
            group={groupDetails} 
            onDepositClick={() => setShowDepositModal(true)}
          />
        </div>
        
        <div className="wallet-section">
          <div className="section-header">
            <h2>Proposals</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowProposalModal(true)}
            >
              Create Proposal
            </button>
          </div>
          
          <div className="proposals-grid">
            {proposals.length > 0 ? (
              proposals.map((proposal, index) => (
                <ProposalCard
                  key={index}
                  proposal={proposal}
                  account={account}
                  threshold={groupDetails?.threshold}
                  onConfirm={() => handleConfirmProposal(index + 1)}
                  onExecute={() => handleExecuteProposal(index + 1)}
                />
              ))
            ) : (
              <p>No proposals yet</p>
            )}
          </div>
        </div>
        
        <div className="wallet-section">
          <h2>History</h2>
          <HistoryCard history={history} />
        </div>
      </div>

      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
        />
      )}

      {showProposalModal && (
        <CreateProposalModal
          onClose={() => setShowProposalModal(false)}
          onCreate={handleCreateProposal}
          balance={ethers.utils.formatEther(groupDetails?.balance || '0')}
        />
      )}
    </div>
  );
}

export default GroupWalletPage;