import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const FacebookLoginButton: React.FC = () => {
  const { loginWithFacebook } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    loginWithFacebook();
    // No need to set loading to false as we're redirecting away
  };

  return (
    <button 
      className={`btn btn-facebook ${isLoading ? 'loading' : ''}`}
      onClick={handleFacebookLogin}
      disabled={isLoading}
    >
      {!isLoading && (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#fff" />
        </svg>
      )}
      {isLoading ? 'Connecting...' : 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLoginButton;