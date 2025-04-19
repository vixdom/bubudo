import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// Import your authentication context or hook here
// Example: import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  // Replace with your actual authentication check
  const isAuthenticated = false; // Placeholder: Check if user is logged in

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
