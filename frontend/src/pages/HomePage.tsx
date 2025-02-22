import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Welcome to Auth Demo</h1>
      <p>This is a simple authentication application with JWT, OAuth and cookie-based authentication.</p>
      <div className="features">
        <h2>Features:</h2>
        <ul>
          <li>User registration and login</li>
          <li>Social login with Google and Facebook</li>
          <li>Secure token storage with HttpOnly cookies</li>
          <li>Protected routes</li>
          <li>Token refresh mechanism</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;