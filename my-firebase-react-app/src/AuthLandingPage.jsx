import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase'; // adjust import path if needed
import './AuthLandingPage.css';

function AuthLandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // Create a new user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update the user's profile with their full name
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`
        });
        
        console.log('User registered:', userCredential.user);
        console.log('Display Name:', userCredential.user.displayName);
        
        // Navigate to home page after successful registration
        navigate('/home');
      } else {
        // Sign in an existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', userCredential.user);
        
        // Navigate to home page after successful sign in
        navigate('/home');
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">SoraSpeak</h1>
        <h2 className="auth-subtitle">{isRegistering ? 'Register' : 'Sign In'}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="auth-input"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="auth-input"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>
        
        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="auth-switch"
        >
          {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

export default AuthLandingPage; 