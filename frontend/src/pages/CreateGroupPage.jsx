import React, { useState } from 'react';

const CreateGroupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    threshold: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle group creation logic
  };

  return (
    <div className="create-group-page">
      <h1>Create New Group</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Approval Threshold</label>
          <input
            type="number"
            min="1"
            value={formData.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
          />
        </div>
        <button type="submit" className="submit-button">Create Group</button>
      </form>
    </div>
  );
};

export default CreateGroupPage;