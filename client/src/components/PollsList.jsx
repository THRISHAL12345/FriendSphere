import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CreatePollModal from "./CreatePollModal";

// --- Single Poll Component ---
// This component renders an individual poll with its options and results.
const Poll = ({ poll, onVote }) => {
  const { userInfo } = useAuth(); // Get current user info to check their vote

  // Calculate total votes for percentage calculation
  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + opt.votes.length,
    0
  );
  // Find if the current user has voted on any option in this poll
  const userVoteOption = poll.options.find((opt) =>
    opt.votes.some((v) => v._id === userInfo._id)
  );

  return (
    <motion.div
      layout // Animates layout changes (e.g., when a new poll appears)
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Poll Header: Question and Total Votes */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {poll.question}
        </h3>
        <p className="text-sm text-gray-500 flex-shrink-0 mt-1 sm:mt-0 sm:ml-4">
          {totalVotes} Total Votes
        </p>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Asked by {poll.createdBy.name}
      </p>

      {/* Poll Options List */}
      <ul className="space-y-3">
        {poll.options.map((option) => {
          // Calculate percentage for the progress bar
          const percentage =
            totalVotes === 0 ? 0 : (option.votes.length / totalVotes) * 100;
          // Check if the current user voted specifically for *this* option
          const hasVotedForThis =
            userVoteOption && userVoteOption._id === option._id;

          return (
            <li
              key={option._id}
              onClick={() => onVote(poll._id, option._id)} // Trigger vote on click
              className="relative p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-all overflow-hidden group"
            >
              {/* Animated Background Progress Bar */}
              <motion.div
                className={`absolute top-0 left-0 h-full bg-primary/10 transition-colors ${
                  hasVotedForThis
                    ? "bg-primary/30"
                    : "group-hover:bg-primary/20"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.1,
                }} // Added delay
              />

              {/* Option Content (Text and Vote Count/Checkmark) */}
              <div className="relative flex justify-between items-center z-10">
                <span
                  className={`font-medium text-sm sm:text-base ${
                    hasVotedForThis
                      ? "text-primary-dark font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {option.text}
                </span>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <span className="text-sm font-semibold text-gray-800 tabular-nums">
                    {Math.round(percentage)}%
                  </span>
                  {/* Show checkmark if user voted for this option */}
                  {hasVotedForThis && (
                    <FiCheck className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

// --- Main Component for the "Polls" Tab ---
// This component fetches polls, manages state, listens to sockets, and renders the list.
const PollsList = ({ roomId }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket } = useSocket(); // Get socket instance from context

  // 1. Fetch initial polls from API when component mounts or roomId changes
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/polls/room/${roomId}`);
        setPolls(data);
      } catch (err) {
        console.error("Error fetching polls:", err);
        setError("Failed to load polls");
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [roomId]); // Dependency array ensures this runs when roomId changes

  // 2. Set up socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      // Listener for when a new poll is created
      const handleNewPoll = (newPoll) => {
        // Add the new poll only if it belongs to the current room
        if (newPoll.room === roomId) {
          console.log("Received new poll:", newPoll);
          // Add to the beginning of the list (newest first)
          setPolls((prevPolls) => [newPoll, ...prevPolls]);
        }
      };

      // Listener for when an existing poll is updated (someone voted)
      const handlePollUpdate = (updatedPoll) => {
        // Update the poll only if it belongs to the current room
        if (updatedPoll.room === roomId) {
          console.log("Received poll update:", updatedPoll);
          // Find and replace the poll in the state with the updated version
          setPolls((prevPolls) =>
            prevPolls.map((p) => (p._id === updatedPoll._id ? updatedPoll : p))
          );
        }
      };

      // Register listeners
      socket.on("newPoll", handleNewPoll);
      socket.on("pollUpdated", handlePollUpdate);

      // Cleanup function: Remove listeners when component unmounts or socket changes
      return () => {
        console.log("Cleaning up poll socket listeners");
        socket.off("newPoll", handleNewPoll);
        socket.off("pollUpdated", handlePollUpdate);
      };
    } else {
      console.log("PollsList: Socket not available for listeners.");
    }
  }, [socket, roomId]); // Re-run if socket instance or roomId changes

  // 3. Function to handle voting: Emits an event to the server
  const handleVote = (pollId, optionId) => {
    if (socket) {
      console.log(`Voting on poll ${pollId}, option ${optionId}`);
      socket.emit("voteOnPoll", { pollId, optionId });
    } else {
      console.error("Socket not connected, cannot vote.");
      // Optionally show an error to the user
      setError("Cannot connect to server to vote. Please refresh.");
    }
  };

  // --- Render Loading/Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  if (error)
    return <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>;

  // --- Render Main Content ---
  return (
    <div className="space-y-6">
      {/* Button to open the "Create Poll" modal */}
      <div className="text-right">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          Create New Poll
        </button>
      </div>

      {/* List of Polls */}
      <div className="space-y-6">
        <AnimatePresence>
          {polls.length === 0 ? (
            // Message shown if there are no polls
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 py-8"
            >
              No polls yet. Create one to get started!
            </motion.p>
          ) : (
            // Map through the polls and render each one using the Poll component
            polls.map((poll) => (
              <Poll key={poll._id} poll={poll} onVote={handleVote} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* The Modal component for creating polls */}
      <CreatePollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={roomId}
      />
    </div>
  );
};

export default PollsList;
