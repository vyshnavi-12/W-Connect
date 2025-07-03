// src/pages/Notifications.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import { AlertCircle, Trash2, Bell, BellOff, Check } from "lucide-react";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("unread");

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

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-yellow-50">
      <Header />

      <div className="flex-1 flex items-start justify-center pt-6 px-4 pb-6 overflow-y-auto">
        <div className="w-full max-w-2xl">

          {/* Tabs */}
          <div className="flex mb-6 bg-white rounded-lg shadow-sm overflow-hidden">
            {["unread", "read", "all"].map((tab, index) => {
              const isActive = activeTab === tab;
              const label =
                tab === "unread" ? "Unread" :
                tab === "read" ? "Read" : "All";

              const count =
                tab === "unread" ? unreadCount :
                tab === "read" ? readCount : notifications.length;

              const Icon =
                tab === "unread" ? Bell :
                tab === "read" ? BellOff : null;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-center font-medium text-sm focus:outline-none transition-all ${
                    index === 0 ? "rounded-l-lg" : index === 2 ? "rounded-r-lg" : ""
                  } ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                      : "text-gray-500 hover:bg-blue-50 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                    <span
                      className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        tab === "unread"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-500">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p>No notifications in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white p-4 rounded-lg shadow-sm flex items-start ${
                    !n.read ? "border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <p className={`${!n.read ? "font-medium text-gray-800" : "text-gray-600"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                  </div>

                  <div className="flex flex-row space-x-2">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                        className="p-2 rounded-md hover:bg-blue-50 text-blue-700 bg-white focus:outline-none border-0"
                        style={{ border: 'none', outline: 'none', background: 'white' }}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      title="Delete"
                      className="p-2 rounded-md hover:bg-red-50 text-red-700 bg-white focus:outline-none border-0"
                      style={{ border: 'none', outline: 'none', background: 'white' }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Notifications;