// src/components/PrivateRouteProvider.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const PrivateRouteProvider = ({ children }) => {
  return isAuthenticated('provider') ? children : <Navigate to="/login" replace />;
};

export default PrivateRouteProvider;
