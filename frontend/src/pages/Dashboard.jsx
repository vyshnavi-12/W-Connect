// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Helper function to decode JWT token
  const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '_').replace(/_/g, '/');
      const decoded = JSON.parse(window.atob(base64));
      return decoded;
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  };

  const decodedToken = getDecodedToken();
  const shopName = decodedToken?.shopName || 'Provider'; // Get shopName from token

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Welcome <span className="capitalize">{shopName}</span> to W-Connect
        </h1>
        <p className="text-gray-600 mb-6">You are logged in successfully!</p>

        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;