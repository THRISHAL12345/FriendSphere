import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiCheck, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CreatePollModal from "./CreatePollModal";

// --- Single Poll Component ---
// Renders an individual poll with options, results, delete button, and voter tooltip.
const Poll = ({ poll, onVote, onDelete }) => {
  const { userInfo } = useAuth(); // Get current user info

  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + (opt.votes?.length || 0),
    0
  );
  // Find if the current user has voted on any option in this poll
  const userVoteOption = poll.options.find(
    (opt) =>
      Array.isArray(opt.votes) &&
      opt.votes.some((v) => v?._id === userInfo?._id)
  );

  // Check if the current user can delete this poll
  const canDelete = poll.createdBy?._id === userInfo?._id; // Only creator for now

  // --- Function to generate tooltip text with voter names ---
  const getVoterNamesTooltip = (votes) => {
    if (!Array.isArray(votes) || votes.length === 0) return "No votes yet";
    const maxNamesToShow = 5;
    const names = votes
      .filter((v) => v && typeof v === "object" && v.name)
      .slice(0, maxNamesToShow)
      .map((v) => v.name)
      .join(", ");
    const remainingCount = votes.length - maxNamesToShow;
    const finalTooltip = `Votes (${votes.length}): ${names}${
      remainingCount > 0 ? ` and ${remainingCount} more` : ""
    }`;
    return finalTooltip;
  };
  // --------------------------------------------------------

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Poll Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words mr-4">
          {poll.question}
        </h3>
        <div className="flex items-center space-x-2 flex-shrink-0 mt-1 sm:mt-0 sm:ml-4">
          <p className="text-sm text-gray-500">{totalVotes} Total Votes</p>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(poll._id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
              title="Delete Poll"
              aria-label="Delete Poll"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Asked by {poll.createdBy?.name || "Unknown User"}
      </p>

      {/* Poll Options List */}
      <ul className="space-y-3">
        {poll.options.map((option) => {
          const voteCount = option.votes?.length || 0;
          const percentage =
            totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;
          const hasVotedForThis = userVoteOption?._id === option._id;
          const voterTooltip = getVoterNamesTooltip(option.votes);

          return (
            <li
              key={option._id}
              // Prevent re-voting on the same option? Maybe remove onClick if already voted?
              // Or allow changing vote by just clicking another option.
              onClick={() => onVote(poll._id, option._id)}
              className="relative p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-all overflow-hidden group"
              title={voterTooltip}
            >
              {/* Animated Background Progress Bar */}
              <motion.div
                className={`absolute top-0 left-0 h-full bg-primary/10 transition-colors ${
                  hasVotedForThis
                    ? "bg-primary/30"
                    : "group-hover:bg-primary/20"
                }`}
                // Animate width based on percentage
                initial={{ width: "0%" }}
                // Use animate prop which reacts to changes in 'percentage'
                animate={{ width: `${percentage}%` }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.1,
                }}
              />

              {/* Option Content */}
              <div className="relative flex justify-between items-center z-10">
                <span
                  className={`font-medium text-sm sm:text-base break-words mr-2 ${
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
const PollsList = ({ roomId }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket } = useSocket();
  const { userInfo } = useAuth(); // Get userInfo for optimistic update

  // 1. Fetch initial polls
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
  }, [roomId]);

  // 2. Set up socket listeners
  useEffect(() => {
    if (socket) {
      const handleNewPoll = (newPoll) => {
        if (newPoll.room === roomId) {
          setPolls((prevPolls) => [newPoll, ...prevPolls]);
        }
      };
      const handlePollUpdate = (updatedPoll) => {
        if (updatedPoll.room === roomId) {
          // This listener now acts as the authoritative update,
          // correcting any minor differences from the optimistic update.
          console.log("Received server poll update:", updatedPoll);
          setPolls((prevPolls) =>
            prevPolls.map((p) => (p._id === updatedPoll._id ? updatedPoll : p))
          );
        }
      };
      const handlePollDeleted = ({ pollId }) => {
        setPolls((prevPolls) => prevPolls.filter((p) => p._id !== pollId));
      };

      socket.on("newPoll", handleNewPoll);
      socket.on("pollUpdated", handlePollUpdate);
      socket.on("pollDeleted", handlePollDeleted);

      // Cleanup
      return () => {
        socket.off("newPoll", handleNewPoll);
        socket.off("pollUpdated", handlePollUpdate);
        socket.off("pollDeleted", handlePollDeleted);
      };
    }
  }, [socket, roomId]);

  // --- vvv OPTIMISTIC UPDATE FOR VOTING vvv ---
  // 3. Handle voting with optimistic update
  const handleVote = (pollId, optionId) => {
    if (!socket || !userInfo) {
      setError("Cannot connect to server to vote. Please refresh.");
      return;
    }
    setError(null); // Clear previous errors

    // Find the poll and option being voted on
    const pollIndex = polls.findIndex((p) => p._id === pollId);
    if (pollIndex === -1) return; // Poll not found

    const pollToUpdate = polls[pollIndex];
    const optionIndex = pollToUpdate.options.findIndex(
      (opt) => opt._id === optionId
    );
    if (optionIndex === -1) return; // Option not found

    // --- Perform Optimistic Update ---
    setPolls((prevPolls) => {
      // Create a deep copy to avoid direct state mutation
      const updatedPolls = JSON.parse(JSON.stringify(prevPolls));
      const optimisticPoll = updatedPolls[pollIndex];

      // 1. Remove user's current vote from *all* options in this poll (if any)
      let userAlreadyVotedOptionIndex = -1;
      optimisticPoll.options.forEach((opt, idx) => {
        const voteIndex = opt.votes.findIndex((v) => v?._id === userInfo._id);
        if (voteIndex !== -1) {
          opt.votes.splice(voteIndex, 1);
          userAlreadyVotedOptionIndex = idx; // Track where the vote was removed from
        }
      });

      // 2. Add user's vote to the *newly selected* option
      // (Only add if they weren't trying to un-vote by clicking the same option again - optional)
      // For simplicity, we always add the vote to the clicked option
      if (optimisticPoll.options[optionIndex]) {
        // Add a simplified representation of the user for the optimistic update
        optimisticPoll.options[optionIndex].votes.push({
          _id: userInfo._id,
          name: userInfo.name,
        });
      }

      console.log("Optimistically updated polls:", updatedPolls);
      return updatedPolls;
    });
    // --- End Optimistic Update ---

    // 4. Emit the actual vote event to the server
    console.log(`Emitting voteOnPoll: poll=${pollId}, option=${optionId}`);
    socket.emit("voteOnPoll", { pollId, optionId });
  };
  // --- ^^^ END OPTIMISTIC UPDATE ^^^ ---

  // 4. Handle deleting a poll
  const handleDeletePoll = (pollId) => {
    if (!socket) {
      setError("Cannot connect to server to delete poll.");
      return;
    }
    setError(null);
    if (window.confirm("Are you sure you want to delete this poll?")) {
      console.log(`Emitting deletePoll: poll=${pollId}`);
      // Optimistically remove the poll
      setPolls((prevPolls) => prevPolls.filter((p) => p._id !== pollId));
      socket.emit("deletePoll", { pollId });
    }
  };

  // --- Render Loading/Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  if (error && polls.length === 0)
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

      {/* Display delete/vote/connection errors here */}
      {error && (
        <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded">
          {error}
        </p>
      )}

      {/* List of Polls */}
      <div className="space-y-6">
        <AnimatePresence>
          {polls.length === 0 ? (
            <motion.p /* ... no polls message ... */>
              No polls yet. Create one to get started!
            </motion.p>
          ) : (
            polls.map((poll) => (
              <Poll
                key={poll._id} // Unique key for React list rendering
                poll={poll} // Pass the poll data
                onVote={handleVote} // Pass the voting function
                onDelete={handleDeletePoll} // Pass the delete function
              /> // Ensure this closing tag is clean
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
