import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PostList from '../components/post/PostList'; 
import { AuthContext } from '../context/AuthContext'; // Adjust to your auth context
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  // Assuming you have an auth context - adjust to your auth implementation
  const { user } = useContext(AuthContext);
  
  return (
    <div className="home-page">
      <h1>Welcome to Unf:t</h1>
      <p>
        A social platform for buying and selling second-hand items. Connect with others to find great deals and give your items a new home.
      </p>

      {user ? (
        // Show posts if user is logged in
        <PostList currentUserId={user._id} />
      ) : (
        // Show call to action if not logged in
        <div className="home-cta">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;