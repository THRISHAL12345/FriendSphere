import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { FiShoppingCart, FiMessageSquare, FiSend } from "react-icons/fi"; // <-- Import icons

const FoodShare = ({ roomId }) => {
  const [vendor, setVendor] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const { sendFoodShare } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendFoodShare({ roomId, vendor, message });
    setVendor("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-orange-100 rounded-full">
          <FiShoppingCart className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 ml-3">
          Food Order Share
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Need to hit a minimum order? Let friends know.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vendor Input */}
        <div className="relative">
          <FiShoppingCart className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g., Zepto, Swiggy"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        {/* Message Input */}
        <div className="relative">
          <FiMessageSquare className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., I need 20 more for free delivery"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-orange-500 rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300"
        >
          Notify Friends
          <FiSend className="ml-2" />
        </button>
        {sent && (
          <p className="text-sm text-center text-green-600">
            Notification sent!
          </p>
        )}
      </form>
    </div>
  );
};

export default FoodShare;
