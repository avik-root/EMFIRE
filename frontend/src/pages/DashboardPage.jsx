import React, { useEffect, useState } from 'react';
import GroupDetailsCard from '../components/GroupDetailsCard';

const DashboardPage = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // Fetch user's groups from API
    const mockGroups = [
      { id: 1, name: 'Family Fund', description: 'Family expenses pool', members: 5, balance: 12.5 },
      { id: 2, name: 'Project DAO', description: 'Development team budget', members: 8, balance: 24.8 }
    ];
    setGroups(mockGroups);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Your Groups</h1>
        <button className="create-group-button">+ New Group</button>
      </div>
      <div className="groups-grid">
        {groups.map(group => (
          <GroupDetailsCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;