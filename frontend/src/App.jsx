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

// Components
import Notifications from './components/Notifications';
import PostStorage from './pages/PostStorage'; // Assuming it's a component you want routed

// Auth Protection
import PrivateRouteProvider from './components/PrivateRouteProvider';
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

        {/* Example Protected Route for Consumer - Uncomment when ready */}
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
