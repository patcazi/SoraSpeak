import React from 'react';
import { auth } from './firebase';

function HomePage() {
  const user = auth.currentUser;
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to SoraSpeak!</h1>
        {user && (
          <p className="auth-subtitle">Hello, {user.displayName || 'User'}</p>
        )}
      </div>
    </div>
  );
}

export default HomePage; 