import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  
  // Sample data (need to be replaced with actual data from the backend)
  const stats = {
    items: 0,
    followers: 348,
    following: 562,
    savedItems: 0,
    taggedItems: 0
  };

  return (
    <div className="dashboard">
      {/* Header with username and hamburger menu */}
      <div className="profile-header-top">
        <h2 className="profile-header-username">{user?.username || 'username'}</h2>
        
        {/* Hamburger menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="hamburger-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          {showMenu && (
            <div className="menu-overlay menu-position">
              <a href="#settings" className="menu-item">Settings</a>
              <a href="#activity" className="menu-item">Your Activity</a>
              <a href="#saved" className="menu-item">Saved</a>
              <a href="#logout" className="menu-item">Log Out</a>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile section */}
      <div className="profile-header">
        {/* Profile picture */}
        <div className="profile-picture">
          <div className="profile-picture-circle">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" />
            ) : (
              <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
        </div>
        
        {/* User info and stats */}
        <div className="profile-info">
                    
          {/* Stats - items, followers, following */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-count">{stats.items}</span> items
            </div>
            <div className="stat-item">
              <span className="stat-count">{stats.followers}</span> followers
            </div>
            <div className="stat-item">
              <span className="stat-count">{stats.following}</span> following
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="btn-edit-profile">Edit Profile</button>
            <button className="btn-share-profile">Share Profile</button>
          </div>
          
          {/* Bio section */}
          <div className="profile-bio">
            <div className="description">{user?.bio || ' '}</div>
          </div>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Posts
        </button>
        <button 
          className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Saved
        </button>
        <button 
          className={`profile-tab ${activeTab === 'tagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('tagged')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          Tagged
        </button>
      </div>
      
      {/* Grid of items */}
      {activeTab === 'grid' && stats.items > 0 && (
        <div className="items-grid">
          {Array.from({length: stats.items}).map((_, i) => (
            <div key={i} className="item-card">
              <img 
                src={`/api/placeholder/300/300`} 
                alt={`Item ${i+1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state if no items */}
      {activeTab === 'grid' && stats.items === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="16"></line>
          </svg>
          <h3>Share Your Items</h3>
          <p>When you list items for sale, they will appear on your profile.</p>
          <button className="btn-add-item">List your first item</button>
        </div>
      )}

      {/* Saved items grid */}
      {activeTab === 'saved' && stats.savedItems > 0 && (
        <div className="items-grid">
          {Array.from({length: stats.savedItems}).map((_, i) => (
            <div key={i} className="item-card">
              <img 
                src={`/api/placeholder/300/300`} 
                alt={`Saved Item ${i+1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state if no saved items */}
      {activeTab === 'saved' && stats.savedItems === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>Save Items</h3>
          <p>Save items that you're interested in to revisit them later.</p>
          <button className="btn-explore">Explore items</button>
        </div>
      )}

      {/* Tagged items grid */}
      {activeTab === 'tagged' && stats.taggedItems > 0 && (
        <div className="items-grid">
          {Array.from({length: stats.taggedItems}).map((_, i) => (
            <div key={i} className="item-card">
              <img 
                src={`/api/placeholder/300/300`} 
                alt={`Tagged Item ${i+1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state if no tagged items */}
      {activeTab === 'tagged' && stats.taggedItems === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <h3>Photos of You</h3>
          <p>When people tag you, it will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;