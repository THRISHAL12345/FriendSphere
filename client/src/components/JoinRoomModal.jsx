import React, { useState } from "react";
import Modal from "./Modal";
import api from "../api/api";

const JoinRoomModal = ({ isOpen, onClose }) => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage("");
    try {
      await api.post(`/rooms/${roomId}/join`);
      setMessage(
        "Join request sent successfully! The room owner must approve you."
      );
      setRoomId("");
      // We don't close the modal, so they can see the success message
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send join request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setRoomId("");
    setError(null);
    setMessage("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join an Existing Room">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label
            htmlFor="roomId"
            className="block text-sm font-medium text-gray-700"
          >
            Room ID
          </label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter the ID you got from a friend"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Sending..." : "Send Join Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinRoomModal;
