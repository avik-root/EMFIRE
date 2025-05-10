import React, { useState } from 'react';

const DepositModal = ({ onClose, onDeposit }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onDeposit(amount);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Deposit Funds</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Deposit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;