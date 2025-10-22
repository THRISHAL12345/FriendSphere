import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const NotificationToast = () => {
  const { lastNotification } = useSocket();
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (lastNotification) {
      setNotification(lastNotification);
      setIsVisible(true);

      // This is the timer that hides the toast.
      // We'll change it from 7 seconds to 10 minutes.
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 600000); // <-- THE FIX: 600,000ms = 10 minutes

      return () => clearTimeout(timer);
    }
  }, [lastNotification]);

  if (!isVisible || !notification) return null;

  const isFood = notification.type === "food";
  const title = isFood
    ? `🍔 Food Order from ${notification.from}`
    : `🚗 Ride Share from ${notification.from}`;
  const message = isFood
    ? `Ordering from ${notification.vendor}: "${notification.message}"`
    : `Going from "${notification.fromLocation}" to "${notification.toLocation}"`;

  return (
    // We'll remove the animate-pulse so it's not distracting
    <div className="fixed bottom-5 right-5 w-80 bg-white rounded-lg shadow-2xl p-4 z-50">
      <div className="flex items-start">
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          {/* This button already allows them to close it manually */}
          <button
            onClick={() => setIsVisible(false)}
            className="inline-flex text-gray-400 hover:text-gray-500"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
