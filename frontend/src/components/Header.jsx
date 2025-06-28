// src/components/Header.jsx
import React, { useState } from 'react';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  return (
    <header className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div
        className="flex items-center space-x-3 group cursor-pointer"
        onClick={() => navigate('/dashboard')} // Optional: click logo to go to dashboard
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        <span className="text-xl font-bold text-blue-900 transition-colors duration-300 group-hover:text-blue-700">
          W-Connect
        </span>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center space-x-4">
        <button
          onClick={handleNotifications}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          <Bell className="w-5 h-5 text-blue-700" />
        </button>
        <button
          onClick={handleLogout}
          className="py-2 px-4 flex items-center space-x-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button className="md:hidden p-2 text-blue-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 flex flex-col space-y-4 md:hidden z-50">
          <button
            onClick={handleNotifications}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Bell className="w-5 h-5 text-blue-700" />
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-4 flex items-center space-x-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
