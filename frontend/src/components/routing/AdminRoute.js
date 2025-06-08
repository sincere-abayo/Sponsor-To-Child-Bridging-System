import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

export default AdminRoute; 