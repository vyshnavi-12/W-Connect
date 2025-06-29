// Dashboard-Header.jsx
import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="w-full p-4 bg-white shadow rounded-lg flex flex-wrap justify-around gap-4">
      <button className="flex-1 min-w-[150px] bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        Post New Stock
      </button>
      <button className="flex-1 min-w-[150px] bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        Post New Storage
      </button>
      <button className="flex-1 min-w-[150px] bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        View Connected Retailers
      </button>
      <button className="flex-1 min-w-[150px] bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        View Transaction History
      </button>
    </div>
  );
};

export default DashboardHeader;
