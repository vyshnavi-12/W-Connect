import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Menu,
  X,
  Settings,
  Package,
  Warehouse,
  Users,
  FileText,
  Archive,
  MessageSquare,
  Grid3X3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMyPostingsOpen, setIsMyPostingsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const myPostingsRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleChat = () => {
    navigate('/chat');
  };

  const handlePostNewStock = () => {
    navigate('/post-stock');
  };

  const handlePostNewStorage = () => {
    navigate('/post-storage');
  };

  const handleViewConnectedRetailers = () => {
    navigate('/connected-retailers');
  };

  const handleMyStockPostings = () => {
    navigate('/my-stock-postings');
  };

  const handleMyStoragePostings = () => {
    navigate('/my-storage-postings');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (myPostingsRef.current && !myPostingsRef.current.contains(event.target)) {
        setIsMyPostingsOpen(false);
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
      <div className="hidden lg:flex items-center space-x-3 relative">
        {/* Dashboard */}
        <button
          onClick={handleDashboard}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-0"
          title="Dashboard"
        >
          <Grid3X3 className="w-5 h-5 text-blue-700" />
        </button>
        {/* Post New Stock */}
        <button
          onClick={handlePostNewStock}
          className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors focus:outline-none focus:ring-0"
          title="Post New Stock"
        >
          <Package className="w-5 h-5 text-green-700" />
        </button>
        {/* Post New Storage */}
        <button
          onClick={handlePostNewStorage}
          className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors focus:outline-none focus:ring-0"
          title="Post New Storage"
        >
          <Warehouse className="w-5 h-5 text-purple-700" />
        </button>
        {/* View Connected Retailers */}
        <button
          onClick={handleViewConnectedRetailers}
          className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors focus:outline-none focus:ring-0"
          title="View Connected Retailers"
        >
          <Users className="w-5 h-5 text-orange-700" />
        </button>
        {/* My Postings Dropdown */}
        <div className="relative" ref={myPostingsRef}>
          <button
            onClick={() => setIsMyPostingsOpen(!isMyPostingsOpen)}
            className="p-2 rounded-full bg-teal-100 hover:bg-teal-200 transition-colors focus:outline-none focus:ring-0"
            title="My Postings"
          >
            <FileText className="w-5 h-5 text-teal-700" />
          </button>
          {isMyPostingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setIsMyPostingsOpen(false);
                  handleMyStockPostings();
                }}
                className="flex items-center w-full text-left px-4 py-2 text-black bg-white hover:bg-green-100 hover:text-black transition-colors duration-200 rounded-t-lg focus:outline-none focus:ring-0"
              >
                <Package className="w-4 h-4 mr-2 text-green-600" />
                Stock Postings
              </button>
              <button
                onClick={() => {
                  setIsMyPostingsOpen(false);
                  handleMyStoragePostings();
                }}
                className="flex items-center w-full text-left px-4 py-2 text-black bg-white hover:bg-purple-100 hover:text-black transition-colors duration-200 rounded-b-lg focus:outline-none focus:ring-0"
              >
                <Archive className="w-4 h-4 mr-2 text-purple-600" />
                Storage Postings
              </button>
            </div>
          )}
        </div>
        {/* Chat */}
        <button
          onClick={handleChat}
          className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 transition-colors focus:outline-none focus:ring-0"
          title="Chat"
        >
          <MessageSquare className="w-5 h-5 text-yellow-700" />
        </button>
        {/* Notifications */}
        <button
          onClick={handleNotifications}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-0"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-blue-700" />
        </button>
        {/* Settings Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-0"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 custom-scrollbar max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  alert('Profile page coming soon!');
                }}
                className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-0"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-0"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden p-1 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-0"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ 
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          backgroundColor: 'transparent',
          border: 'none'
        }}
      >
        {isMenuOpen ? (
          <X className="w-6 h-6 text-blue-700" />
        ) : (
          <Menu className="w-6 h-6 text-blue-700" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 flex flex-col space-y-3 lg:hidden z-50 w-64 max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
          {/* Dashboard */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleDashboard();
            }}
            className="flex items-center p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Grid3X3 className="w-5 h-5 text-blue-700 mr-3" />
            <span className="text-blue-700 font-medium">Dashboard</span>
          </button>
          {/* Post New Stock */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handlePostNewStock();
            }}
            className="flex items-center p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Package className="w-5 h-5 text-green-700 mr-3" />
            <span className="text-green-700 font-medium">Post New Stock</span>
          </button>
          {/* Post New Storage */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handlePostNewStorage();
            }}
            className="flex items-center p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Warehouse className="w-5 h-5 text-purple-700 mr-3" />
            <span className="text-purple-700 font-medium">Post New Storage</span>
          </button>
          {/* View Connected Retailers */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleViewConnectedRetailers();
            }}
            className="flex items-center p-2 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Users className="w-5 h-5 text-orange-700 mr-3" />
            <span className="text-orange-700 font-medium">Connected Retailers</span>
          </button>
          {/* My Stock Postings */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleMyStockPostings();
            }}
            className="flex items-center p-2 rounded-lg bg-teal-100 hover:bg-teal-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Package className="w-5 h-5 text-teal-700 mr-3" />
            <span className="text-teal-700 font-medium">Stock Postings</span>
          </button>
          {/* My Storage Postings */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleMyStoragePostings();
            }}
            className="flex items-center p-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Archive className="w-5 h-5 text-pink-700 mr-3" />
            <span className="text-pink-700 font-medium">Storage Postings</span>
          </button>
          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>
          {/* Chat */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleChat();
            }}
            className="flex items-center p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors focus:outline-none focus:ring-0"
          >
            <MessageSquare className="w-5 h-5 text-yellow-700 mr-3" />
            <span className="text-yellow-700 font-medium">Chat</span>
          </button>
          {/* Notifications */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleNotifications();
            }}
            className="flex items-center p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-0"
          >
            <Bell className="w-5 h-5 text-blue-700 mr-3" />
            <span className="text-blue-700 font-medium">Notifications</span>
          </button>
          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center w-full p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-0"
            >
              <Settings className="w-5 h-5 text-gray-700 mr-3" />
              <span className="text-gray-700 font-medium">Settings</span>
            </button>
            {isDropdownOpen && (
              <div className="mt-2 ml-4 space-y-1 custom-scrollbar max-h-40 overflow-y-auto">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsMenuOpen(false);
                    alert('Profile page coming soon!');
                  }}
                  className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 rounded-lg border focus:outline-none focus:ring-0"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-black bg-white hover:bg-blue-100 hover:text-black transition-colors duration-200 rounded-lg border focus:outline-none focus:ring-0"
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