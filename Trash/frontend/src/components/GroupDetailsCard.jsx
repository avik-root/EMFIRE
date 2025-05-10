import React from 'react';
import { Link } from 'react-router-dom';

const GroupDetailsCard = ({ group }) => {
  return (
    <div className="group-details-card">
      <div className="group-header">
        <h3>{group.name}</h3>
        <span className="group-id">ID: {group.id}</span>
      </div>
      <p className="group-description">{group.description}</p>
      <div className="group-stats">
        <div className="stat-item">
          <span>Members</span>
          <strong>{group.members}</strong>
        </div>
        <div className="stat-item">
          <span>Balance</span>
          <strong>{group.balance} ETH</strong>
        </div>
      </div>
      <Link to={`/group/${group.id}`} className="view-group-button">
        Manage Group
      </Link>
    </div>
  );
};

export default GroupDetailsCard;