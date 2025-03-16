import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import PostList from '../components/post/PostList'; 
import { AuthContext } from '../context/AuthContext'; // Assuming you have an auth context

const HomePage: React.FC = () => {
  const { user : currentUser } = useContext(AuthContext); // Get the current user ID
  
  return (
    <div className="home-page">
      <h1>Welcome to Unf:t</h1>
      <p>
        A social platform for buying and selling second-hand items. Connect with others to find great deals and give your items a new home.
      </p>

      {currentUser ? (
        <PostList currentUserId={currentUser._id} />
      ) : (
        <div className="home-cta">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;