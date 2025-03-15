import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Welcome to Unf:t</h1>
      <p>
        A social platform for buying and selling second-hand items. Connect with others to find great deals and give your items a new home.
      </p>

      <div className="home-cta">
        <Link to="/register" className="btn btn-primary">Get Started</Link>
      </div>
    </div>
  );
};

export default HomePage;