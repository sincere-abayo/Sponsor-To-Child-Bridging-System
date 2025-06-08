import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Sponsorships from './pages/Sponsorships';
import Messages from './pages/Messages';
import AdminDashboard from './pages/admin/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import SponsorDashboard from './pages/SponsorDashboard';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/sponsorships" element={
            <PrivateRoute>
              <Sponsorships />
            </PrivateRoute>
          } />
          
          <Route path="/messages" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          
          <Route path="/sponsor-dashboard" element={
            <PrivateRoute>
              <SponsorDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </Box>
    </Box>
  );
};

export default App; 