import React, { useState } from "react";
import api from "../api/api";

const ManageRequests = ({ roomId, pendingRequests, onRequestsUpdated }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const handleManageRequest = async (requestingUserId, action) => {
    setLoading((prev) => ({ ...prev, [requestingUserId]: true }));
    setError(null);
    try {
      await api.put(`/rooms/${roomId}/manage`, {
        requestingUserId,
        action,
      });
      onRequestsUpdated(); // Tell the parent page to refetch data
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setLoading((prev) => ({ ...prev, [requestingUserId]: false }));
    }
  };

  if (pendingRequests.length === 0) {
    return null; // Don't show anything if there are no requests
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Pending Join Requests</h2>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <ul className="space-y-3">
        {pendingRequests.map((user) => (
          <li
            key={user._id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
          >
            <div>
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-gray-500 ml-2">({user.email})</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleManageRequest(user._id, "accept")}
                disabled={loading[user._id]}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
              >
                Accept
              </button>
              <button
                onClick={() => handleManageRequest(user._id, "reject")}
                disabled={loading[user._id]}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageRequests;
