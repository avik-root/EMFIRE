import React, { useState } from 'react';

const AuthForm = ({ onConnectWallet, onSubmit }) => {
  const [username, setUsername] = useState('');

  return (
    <div className="auth-form">
      <button onClick={onConnectWallet}>Connect Wallet</button>
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username);
      }}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default AuthForm;