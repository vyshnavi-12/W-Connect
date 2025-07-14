import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ConsumerRegister from './pages/Consumer-Regisgter';
import ConsumerLogin from './pages/Consumer-Login';
import Chat from './pages/Chat';
import PrivateRouteConsumer from './components/PrivateRouteConsumer';
import ConsumerDashboard from './pages/Consumer-Dashboard';
import ConsumerNotifications from './components/Consumer-Notifications';

// Components
import Notifications from './components/Notifications';
import PostStorage from './pages/PostStorage';
import PostStock from './pages/PostStock';

// Auth Protection
import PrivateRouteProvider from './components/PrivateRouteProvider';
import ViewConnectedRetailers from './pages/ViewConnectedRetailer';
// import PrivateRouteConsumer from './components/PrivateRouteConsumer'; // For future use

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
        <Route
          path="/post-storage"
          element={
            <PrivateRouteProvider>
              <PostStorage />
            </PrivateRouteProvider>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRouteProvider>
              <Chat />
            </PrivateRouteProvider>
          }
        />
        <Route
          path="/post-stock"
          element={
            <PrivateRouteProvider>
              <PostStock />
            </PrivateRouteProvider>
          }
        />
        <Route
          path="/connected-retailers"
          element={
            <PrivateRouteProvider>
              <ViewConnectedRetailers />
            </PrivateRouteProvider>
          }
        />

        {/* Protected Routes for Consumer */}
        <Route
          path="/consumer-dashboard"
          element={
            <PrivateRouteConsumer>
              <ConsumerDashboard />
            </PrivateRouteConsumer>
          }
        />
        <Route
          path="/consumer-chat"
          element={
            <PrivateRouteConsumer>
              <ConsumerDashboard />
            </PrivateRouteConsumer>
          }
        />
        <Route
          path="/consumer-notifications"
          element={
            <PrivateRouteConsumer>
              <ConsumerNotifications />
            </PrivateRouteConsumer>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;