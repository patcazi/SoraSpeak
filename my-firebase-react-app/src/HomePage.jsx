import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import './HomePage.css';

function HomePage() {
  const { currentUser } = useContext(AuthContext);
  const firstNameOnly = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'User';
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to SoraSpeak!</h1>
        <p className="greeting">Hello, {firstNameOnly}</p>
      </div>
    </div>
  );
}

export default HomePage; 