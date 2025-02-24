import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <h1>My Dashboard</h1>
      
      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Username:</strong> {user?.username || 'Not provided'}</p>
        <p><strong>ID:</strong> {user?._id}</p>
      </div>
      
      <div className="dashboard-content">
        <h2>Welcome to Unf:t Second Hand</h2>
        <p>
          This is your personal dashboard where you can manage your second-hand fashion items,
          track your orders, and update your profile information.
        </p>
        
        <div className="dashboard-stats">
          <div className="stat-item">
            <h3>Items Listed</h3>
            <p>0</p>
          </div>
          <div className="stat-item">
            <h3>Items Sold</h3>
            <p>0</p>
          </div>
          <div className="stat-item">
            <h3>Items Purchased</h3>
            <p>0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;