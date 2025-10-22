import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { FiNavigation, FiMapPin, FiSend } from "react-icons/fi"; // <-- Import icons

const TravelShare = ({ roomId }) => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [sent, setSent] = useState(false);
  const { sendTravelShare } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendTravelShare({ roomId, fromLocation, toLocation });
    setFromLocation("");
    setToLocation("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-cyan-100 rounded-full">
          <FiNavigation className="w-5 h-5 text-cyan-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 ml-3">
          Travel Share
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Going somewhere? See if a friend wants to split the ride.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From Input */}
        <div className="relative">
          <FiMapPin className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            placeholder="From (e.g., Hostel)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        {/* To Input */}
        <div className="relative">
          <FiNavigation className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            placeholder="To (e.g., Airport)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-cyan-500 rounded-lg shadow-md hover:bg-cyan-600 transition-all duration-300"
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

export default TravelShare;
