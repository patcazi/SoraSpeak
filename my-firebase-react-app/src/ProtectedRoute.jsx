import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    // Show a loading message or spinner while we await the auth state
    return <div>Loading...</div>;
  }

  // If logged in, render child components; otherwise, navigate to "/"
  return currentUser ? children : <Navigate to="/" />;
}

export default ProtectedRoute; 