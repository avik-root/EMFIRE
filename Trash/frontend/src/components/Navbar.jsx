import React from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand">Emfire Groups</Link>
        <div className="nav-items">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/create-group" className="nav-link">Create Group</Link>
          <Link to="/join-group" className="nav-link">Join Group</Link>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;