import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Tabs from "../components/Tabs";
import ExpenseTracker from "../components/ExpenseTracker";
import PhotoGallery from "../components/PhotoGallery";
import FoodShare from "../components/FoodShare";
import TravelShare from "../components/TravelShare";
import RoomSettings from "../components/RoomSettings";
import ChatWindow from "../components/ChatWindow";
import TodoList from "../components/TodoList";
import PollsList from "../components/PollsList";
import { FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

// --- Small Avatar Component for Members List ---
// Define this component *before* it's used in the 'tabs' array
const MemberAvatar = ({ src, name }) => (
  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3 border border-gray-300">
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" />
    ) : (
      <FiUser className="w-6 h-6 text-gray-500" />
    )}
  </div>
);

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const { userInfo } = useAuth();
  const { joinRoomSocket } = useSocket();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Chat"); // Default to Chat

  // Fetches all room details from the API
  const fetchRoomDetails = async () => {
    // Keep showing loading indicator on refetch unless it's the very first load
    if (!room) setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/rooms/${roomId}`);
      setRoom(data);
      joinRoomSocket(roomId); // Join the socket room for real-time updates
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch room details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and if roomId changes
  useEffect(() => {
    fetchRoomDetails();
  }, [roomId, joinRoomSocket]); // Dependencies for useEffect

  // This function is passed down to child components (like RoomSettings)
  // so they can trigger a refetch of the room data after making changes.
  const handleDataUpdate = () => {
    fetchRoomDetails();
  };

  // Function to handle tab clicks and update state
  const handleTabClick = (tabName) => {
    console.log("Setting active tab to:", tabName); // Debug log
    setActiveTab(tabName);
  };

  // --- Loading and Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  if (error)
    return (
      <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
        {error}
      </p>
    );
  if (!room) return null; // Important check

  const isOwner = userInfo._id === room.owner._id;

  // --- Define the structure for each tab ---
  const tabs = [
    {
      name: "Chat",
      content: <ChatWindow roomId={room._id} />,
    },
    {
      name: "To-Do",
      content: <TodoList roomId={room._id} />,
    },
    {
      name: "Polls",
      content: <PollsList roomId={room._id} />,
    },
    {
      name: "Expenses",
      content: <ExpenseTracker roomId={room._id} members={room.members} />,
    },
    {
      name: "Gallery",
      content: <PhotoGallery roomId={room._id} members={room.members} />,
    },
    {
      name: "Members",
      content: (
        <ul className="space-y-3 max-w-2xl mx-auto">
          {/* Ensure 'members' is an array before mapping */}
          {Array.isArray(room.members) &&
            room.members.map((member) => (
              <li
                key={member._id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  {/* Use the defined MemberAvatar component */}
                  <MemberAvatar
                    src={member.profilePictureUrl}
                    name={member.name}
                  />
                  <div>
                    <span className="font-semibold text-gray-800">
                      {member.name}
                    </span>
                    <span className="block text-sm text-gray-500">
                      {member.email}
                    </span>
                  </div>
                </div>
                {member._id === room.owner._id && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Owner
                  </span>
                )}
              </li>
            ))}
        </ul>
      ),
    },
    {
      name: "Share",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <FoodShare roomId={room._id} />
          <TravelShare roomId={room._id} />
        </div>
      ),
    },
    // Conditionally add the 'Settings' tab only if the current user is the owner
    ...(isOwner
      ? [
          {
            name: "Settings",
            content: (
              <RoomSettings
                room={room}
                members={room.members}
                onUpdate={handleDataUpdate} // Pass the refetch function
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-r from-primary to-purple-700 text-white rounded-lg shadow-lg">
        <div>
          <h1 className="text-4xl font-bold">{room.name}</h1>
          <p className="mt-1 opacity-80">Manage everything for this sphere.</p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <span className="text-sm opacity-70 block">Room ID</span>
          <code className="block bg-black/20 p-2 rounded text-sm font-mono mt-1">
            {room._id}
          </code>
        </div>
      </div>

      {/* Tabbed Interface Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick} // Use the function with the console.log
        />
      </div>
    </motion.div>
  );
};

export default RoomDetailPage;
