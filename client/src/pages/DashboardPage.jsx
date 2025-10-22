import React, { useState, useEffect } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion"; // <-- Import motion
import { FiPlus, FiArrowRight, FiUsers } from "react-icons/fi"; // <-- Import icons

const DashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const { userInfo } = useAuth(); // Get user info

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/rooms/myrooms");
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomCreated = (newRoom) => {
    setRooms((prevRooms) => [newRoom, ...prevRooms]);
  };

  return (
    <>
      <div>
        {/* --- New Animated Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {userInfo?.name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Here are your active friend spheres.
          </p>
        </motion.div>

        <div className="flex justify-end items-center mb-6 space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all"
          >
            <FiPlus className="mr-2" />
            Create Room
          </button>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
          >
            <FiArrowRight className="mr-2" />
            Join Room
          </button>
        </div>

        {loading && <p>Loading rooms...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                You are not in any rooms yet. Create or join one!
              </p>
            ) : (
              rooms.map((room, index) => (
                // --- Animated Room Card ---
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }} // <-- Cool hover effect
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                    {room.name}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-4">
                    <FiUsers className="mr-2" />
                    <span className="text-sm">
                      {room.members.length} member(s)
                    </span>
                  </div>
                  <Link
                    to={`/room/${room._id}`}
                    className="font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </>
  );
};

export default DashboardPage;
