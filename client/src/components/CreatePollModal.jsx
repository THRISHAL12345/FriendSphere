import React, { useState } from "react";
import Modal from "./Modal";
import { useSocket } from "../context/SocketContext";
import { FiPlus, FiTrash2, FiSend, FiHelpCircle } from "react-icons/fi";

const CreatePollModal = ({ isOpen, onClose, roomId }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // Start with 2 options
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      setError("A poll must have at least 2 options.");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (options.some((opt) => opt.trim() === "")) {
      setError("All options must be filled out.");
      return;
    }

    socket.emit("createPoll", {
      roomId,
      question,
      options: options.filter((opt) => opt.trim() !== ""), // Send clean data
    });

    // Reset form and close
    setQuestion("");
    setOptions(["", ""]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a New Poll">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question */}
        <div className="relative">
          <FiHelpCircle className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Poll Question (e.g., Where to order dinner?)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className={`text-gray-400 hover:text-red-500 ${
                  options.length <= 2 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={options.length <= 2}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <FiPlus className="mr-1" /> Add Option
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all"
        >
          <FiSend className="mr-2" />
          Create Poll
        </button>
      </form>
    </Modal>
  );
};

export default CreatePollModal;
