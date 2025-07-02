// src/pages/Notifications.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AlertCircle, Trash2, ArrowLeft } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 2,
      type: "message",
      message: "New message from Rama Retailers",
    },
    {
      id: 2,
      type: "message",
      message: "New message from Rama Retailers",
    },
  ]);

  const handleDelete = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-yellow-50">
      <Header />

      {/* Back Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      {/* Notifications Container */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
            Notifications
          </h1>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-500 mt-20">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p>No new notifications at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white shadow-md p-4 rounded-xl relative flex flex-col"
                >
                  {notification.type === "request" ? (
                    <>
                      <p className="font-bold text-blue-900">
                        {notification.shopName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.email}
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button className="px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600 text-sm font-semibold">
                          Accept
                        </button>
                        <button className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm font-semibold">
                          Ignore
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700">{notification.message}</p>
                  )}

                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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
