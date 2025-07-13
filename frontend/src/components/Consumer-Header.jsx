import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Settings,
  MessageSquare,
  AlertCircle,
  Trash2,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConsumerHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New message from Green Valley Farmers about organic vegetables",
      timestamp: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "Fresh Dairy Co. has responded to your inquiry",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "New provider match found for your grocery needs",
      timestamp: "2 hours ago",
      read: true,
    },
    {
      id: 4,
      message: "Weekly deals available from your connected providers",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: 5,
      message: "System update: Enhanced chat features now available",
      timestamp: "2 days ago",
      read: true,
    }
  ]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('consumerId');
    navigate('/consumer-login');
  };

  const handleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleViewAllNotifications = () => {
    setIsNotificationsOpen(false);
    navigate('/consumer-notifications');
  };

  const handleChat = () => {
    navigate('/consumer-chat');
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
    <header className="w-full bg-white border-b border-gray-200 shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-3 group cursor-pointer">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        <span className="text-xl font-bold text-blue-900 transition-colors duration-300 group-hover:text-blue-700">
          W-Connect
        </span>
      </div>

      {/* Desktop Actions */}
      <div className="flex items-center space-x-3 relative">
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
                
                {/* Tabs */}
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

              {/* View All Button */}
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
    </header>
  );
};

export default ConsumerHeader;