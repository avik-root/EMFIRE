import React from 'react';

const HistoryCard = ({ transaction }) => {
  return (
    <div className="history-card">
      <div className="transaction-meta">
        <span className="transaction-type">{transaction.type}</span>
        <span className="transaction-date">{transaction.date}</span>
      </div>
      <div className="transaction-details">
        <span className="transaction-amount">{transaction.amount} ETH</span>
        <span className={`transaction-status ${transaction.status}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

export default HistoryCard;