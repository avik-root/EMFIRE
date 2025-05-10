import React, { useState } from 'react';
import { ethers } from 'ethers';

const CreateGroupPage = ({ contract, account }) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState(['']);

  const handleCreateGroup = async () => {
    const validMembers = members.filter(m => ethers.utils.isAddress(m));
    await contract.createGroup(groupName, validMembers);
  };

  return (
    <div className="create-group">
      <h2>Create New Group</h2>
      <input
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.targetValue)}
      />
      {members.map((member, index) => (
        <input
          key={index}
          placeholder={`Member ${index + 1} Address`}
          value={member}
          onChange={(e) => {
            const newMembers = [...members];
            newMembers[index] = e.target.value;
            setMembers(newMembers);
          }}
        />
      ))}
      <button onClick={handleCreateGroup}>Create Group</button>
    </div>
  );
};