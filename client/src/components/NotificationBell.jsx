import React, { useState, useEffect } from "react";
import api from "../api/api";
import { FiBell, FiCheck } from "react-icons/fi"; // <-- Import icon

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications/my");
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <FiBell className="w-6 h-6 text-gray-600 hover:text-primary" />{" "}
        {/* <-- Use icon */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-2xl z-20 border border-gray-100">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-gray-800">Notifications</h4>
          </div>
          <div className="py-1">
            {notifications.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b last:border-b-0 ${
                    !n.isRead ? "bg-primary/10" : "bg-white"
                  }`}
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="flex items-center text-xs text-primary hover:underline"
                      >
                        <FiCheck className="mr-1" /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
