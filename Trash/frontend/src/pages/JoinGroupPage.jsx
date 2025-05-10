import React, { useState } from 'react';

const JoinGroupPage = () => {
  const [groupAddress, setGroupAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle group join logic
  };

  return (
    <div className="join-group-page">
      <h1>Join Existing Group</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Group Contract Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={groupAddress}
            onChange={(e) => setGroupAddress(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">Join Group</button>
      </form>
    </div>
  );
};

export default JoinGroupPage;