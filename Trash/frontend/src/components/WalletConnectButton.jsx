import React, { useState, useEffect } from 'react';

const WalletConnectButton = () => {
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <button className="wallet-connect-button" onClick={connectWallet}>
      {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect Wallet'}
    </button>
  );
};

export default WalletConnectButton;