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
  Grid3X3,
  AlertCircle,
  Trash2,
  BellOff,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMyPostingsOpen, setIsMyPostingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const myPostingsRef = useRef(null);
  const notificationsRef = useRef(null);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New message from Rama Retailers about your vegetable surplus",
      timestamp: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "Your storage listing has been approved and is now visible",
      timestamp: "3 hours ago",
      read: false,
    },
    {
      id: 3,
      message: "New match found for your dairy products with Fresh Grocers",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: 4,
      message: "Reminder: Your vegetable listing expires in 2 days",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: 5,
      message: "System update: New matching algorithm deployed",
      timestamp: "3 days ago",
      read: true,
    }
  ]);

  const handleLogout = () => {
    // Clear all possible tokens to ensure clean logout
    localStorage.removeItem('token');
    localStorage.removeItem('providerToken');
    localStorage.removeItem('consumerToken');
    localStorage.removeItem('providerId');
    localStorage.removeItem('consumerId');
    navigate('/login');
  };

  const handleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleViewAllNotifications = () => {
    setIsNotificationsOpen(false);
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

  // Notification functions
  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (myPostingsRef.current && !myPostingsRef.current.contains(event.target)) {
        setIsMyPostingsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
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
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleNotifications}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-0 relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-blue-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  <span className="text-sm text-gray-500">({unreadCount})</span>
                </div>
                
                {/* Updated Tabs to match the image */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("unread")}
                    className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                      activeTab === "unread"
                        ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 bg-white"
                    }`}
                  >
                    Unread {unreadCount > 0 && <span className="ml-1 text-blue-600">{unreadCount}</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab("read")}
                    className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                      activeTab === "read"
                        ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 bg-white"
                    }`}
                  >
                    Read {readCount > 0 && <span className="ml-1 text-gray-500">{readCount}</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                      activeTab === "all"
                        ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 bg-white"
                    }`}
                  >
                    All <span className="ml-1 text-gray-500">{notifications.length}</span>
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm">No notifications in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 hover:bg-gray-50 flex items-start ${
                          !n.read ? "bg-blue-50 border-l-4 border-blue-500" : ""
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <p className={`text-sm ${!n.read ? "font-medium text-gray-800" : "text-gray-600"}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                        </div>
                        <div className="flex space-x-1">
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              title="Mark as read"
                              className="p-1 rounded bg-white hover:bg-blue-100 text-blue-600 focus:outline-none"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            title="Delete"
                            className="p-1 rounded bg-white hover:bg-red-100 text-red-600 focus:outline-none"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View All Button with blue background */}
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleViewAllNotifications}
                  className="w-full text-center text-white bg-blue-700 hover:bg-blue-100 hover:text-blue-700 font-medium text-sm py-2 rounded-lg transition-colors focus:outline-none focus:ring-0"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
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
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
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