// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div
        className="flex items-center space-x-3 group cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        <span className="text-xl font-bold text-blue-900 transition-colors duration-300 group-hover:text-blue-700">
          W-Connect
        </span>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center space-x-4 relative">
        <button
          onClick={handleNotifications}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          <Bell className="w-5 h-5 text-blue-700" />
        </button>

        {/* Settings Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  alert('Profile page coming soon!');
                }}
                className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 rounded-t-lg"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 rounded-b-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>

            {isDropdownOpen && (
              <div className="mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    alert('Profile page coming soon!');
                  }}
                  className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 rounded-t-lg"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
