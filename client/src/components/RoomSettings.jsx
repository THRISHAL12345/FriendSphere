import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ManageRequests from "./ManageRequests";
import { FiSave, FiUserMinus, FiTrash2, FiEdit2 } from "react-icons/fi";

const RoomSettings = ({ room, members, onUpdate }) => {
  const [roomName, setRoomName] = useState(room.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.put(`/rooms/${room._id}`, { name: roomName });
      onUpdate(); // Refetch data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await api.put(`/rooms/${room._id}/remove`, { memberId });
        onUpdate(); // Refetch data
      } catch (err) {
        setError(err.response?.data?.message || "Failed to remove member");
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (
      window.confirm(
        "Are you sure? This will delete the room and all its data. This cannot be undone."
      )
    ) {
      try {
        await api.delete(`/rooms/${room._id}`);
        navigate("/"); // Go back to dashboard after deletion
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete room");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Join Requests */}
      <ManageRequests
        roomId={room._id}
        pendingRequests={room.pendingRequests}
        onRequestsUpdated={onUpdate}
      />

      {/* Update Room Name */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Update Room Name
        </h3>
        <form onSubmit={handleUpdateName} className="flex space-x-3">
          <div className="relative flex-grow">
            <FiEdit2 className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark transition-all"
          >
            <FiSave className="mr-2" />
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      {/* Manage Members */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Manage Members
        </h3>
        <ul className="mt-4 space-y-3">
          {members.map((member) => (
            <li
              key={member._id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
            >
              <span className="font-medium">{member.name}</span>
              {member._id !== room.owner._id && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  <FiUserMinus className="mr-1" />
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="p-6 border-2 border-red-500 rounded-lg bg-red-50">
        <h3 className="text-xl font-semibold text-red-900">Danger Zone</h3>
        <p className="text-sm text-red-700 mt-2">
          Deleting your room is permanent. All photos, expenses, and data will
          be lost.
        </p>
        <button
          onClick={handleDeleteRoom}
          className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800 transition-all"
        >
          <FiTrash2 className="mr-2" />
          Delete This Room
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default RoomSettings;
