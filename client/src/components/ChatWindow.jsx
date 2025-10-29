import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiUser } from "react-icons/fi";

// --- Small Avatar Component ---
const ChatAvatar = ({ src }) => (
  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
    {src ? (
      <img src={src} alt="Avatar" className="w-full h-full object-cover" />
    ) : (
      <FiUser className="w-5 h-5 text-gray-500" />
    )}
  </div>
);

const ChatWindow = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();
  const { userInfo } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/messages/room/${roomId}`);
        setMessages(data);
      } catch (err) {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (incomingMessage) => {
        if (incomingMessage.room === roomId) {
          setMessages((prevMessages) => [...prevMessages, incomingMessage]);
        }
      });
      return () => {
        socket.off("newMessage");
      };
    }
  }, [socket, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !socket) return;
    socket.emit("sendMessage", {
      roomId,
      text: newMessage,
    });
    setNewMessage("");
  };

  if (loading) return <p>Loading chat...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col h-[70vh] sm:h-[600px] bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Message Display Area */}
      <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-4">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.sender._id === userInfo._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start max-w-sm sm:max-w-md ${
                    isMe
                      ? "flex-row-reverse space-x-reverse"
                      : "flex-row space-x-2"
                  }`}
                >
                  <ChatAvatar src={msg.sender.profilePictureUrl} />
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${
                      isMe
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        {msg.sender.name}
                      </p>
                    )}
                    <p>{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-primary-light" : "text-gray-500"
                      }`}
                      style={{ opacity: 0.7 }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="p-2 sm:p-4 border-t border-gray-200 bg-gray-50">
        <form
          onSubmit={handleSendMessage}
          className="flex space-x-2 sm:space-x-3"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
