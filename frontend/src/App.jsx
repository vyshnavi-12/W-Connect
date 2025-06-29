import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Notifications from './components/Notifications';
import ConsumerRegister from './pages/Consumer-Regisgter';
import ConsumerLogin from './pages/Consumer-Login';

// Auth Protection
import PrivateRouteProvider from './components/PrivateRouteProvider';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/consumer-register" element={<ConsumerRegister />} />
        <Route path="/consumer-login" element={<ConsumerLogin />} />

        {/* Protected Routes for Provider */}
        <Route
          path="/dashboard"
          element={
            <PrivateRouteProvider>
              <Dashboard />
            </PrivateRouteProvider>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRouteProvider>
              <Notifications />
            </PrivateRouteProvider>
          }
        />

        {/* Example Protected Route for Consumer */}
        {/* If you have consumer dashboard in future */}
        {/* <Route
          path="/consumer-dashboard"
          element={
            <PrivateRouteConsumer>
              <ConsumerDashboard />
            </PrivateRouteConsumer>
          }
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
