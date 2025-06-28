// src/utils/PrivateRouteConsumer.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const PrivateRouteConsumer = ({ children }) => {
  return isAuthenticated('consumer') ? children : <Navigate to="/consumer-login" replace />;
};

export default PrivateRouteConsumer;
