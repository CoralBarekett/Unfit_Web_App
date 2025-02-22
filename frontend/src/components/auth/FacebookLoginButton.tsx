import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const FacebookLoginButton: React.FC = () => {
  const { loginWithFacebook } = useContext(AuthContext);

  return (
    <button 
      className="btn-facebook" 
      onClick={loginWithFacebook}
    >
      Login with Facebook
    </button>
  );
};

export default FacebookLoginButton;