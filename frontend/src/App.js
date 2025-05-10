import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import './assets/styles/App.css';

// Components
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CreateGroupPage from './pages/CreateGroupPage';
import JoinGroupPage from './pages/JoinGroupPage';
import GroupWalletPage from './pages/GroupWalletPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Contract ABI
import EmfireGroup from './contracts/EmfireGroup.json';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWalletConnection();
    checkUserSession();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setupContract(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
    setLoading(false);
  };

  const setupContract = async (account) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(account);
    const contract = new ethers.Contract(
      process.env.REACT_APP_CONTRACT_ADDRESS,
      EmfireGroup.abi,
      signer
    );
    setProvider(provider);
    setContract(contract);
  };

  const checkUserSession = async () => {
    try {
      const response = await axios.get('/api/auth/check', { withCredentials: true });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error checking user session:", error);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setupContract(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error("Error connecting wallet:", error);
        throw error;
      }
    } else {
      alert('Please install MetaMask to use this application!');
      throw new Error('MetaMask not installed');
    }
  };

  const loginUser = async (walletAddress, username) => {
    try {
      const response = await axios.post('/api/auth/login', {
        walletAddress,
        username
      }, { withCredentials: true });
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navbar account={account} user={user} />
        <Routes>
          <Route path="/" element={
            !account ? <AuthPage connectWallet={connectWallet} loginUser={loginUser} /> :
            !user ? <Navigate to="/auth" /> :
            user.currentGroup ? <DashboardPage /> :
            <Navigate to="/create-group" />
          } />
          <Route path="/auth" element={<AuthPage connectWallet={connectWallet} loginUser={loginUser} />} />
          <Route path="/create-group" element={
            <CreateGroupPage 
              account={account} 
              contract={contract} 
              user={user} 
            />
          } />
          <Route path="/join-group" element={
            <JoinGroupPage 
              account={account} 
              contract={contract} 
              user={user} 
            />
          } />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/group-wallet" element={
            <GroupWalletPage 
              account={account} 
              contract={contract} 
              provider={provider} 
              user={user} 
            />
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;