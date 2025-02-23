import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Username:</strong> {user?.username || 'Not provided'}</p>
        <p><strong>ID:</strong> {user?._id}</p>
      </div>
      
      <div className="dashboard-content">
        <h2>Protected Content</h2>
        <p>This is protected content only visible to authenticated users.</p>
      </div>
    </div>
  );
};

export default Dashboard;