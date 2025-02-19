import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './HomePage.css';

function HomePage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const firstNameOnly = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'User';
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to SoraSpeak!</h1>
        <p className="greeting">Hello, {firstNameOnly}</p>
        <div className="button-container">
          <button className="home-button" onClick={() => console.log('Profile clicked')}>
            Profile
          </button>
          <button className="home-button" onClick={() => navigate('/post-video')}>
            Post Video
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 