// src/pages/Dashboard.jsx
import React from 'react';
import Header from '../components/Header';

const Dashboard = () => {
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
  const shopName = decodedToken?.shopName || 'Provider';

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center w-full h-full flex items-center justify-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 mb-4">
              Welcome <span className="capitalize">{shopName}</span> to W-Connect
            </h1>
            <p className="text-gray-600 text-base">You are logged in successfully!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
