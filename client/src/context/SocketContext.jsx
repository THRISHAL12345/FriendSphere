import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const { userInfo } = useAuth();

  useEffect(() => {
    if (userInfo) {
      // Connect to the server with authentication token
      const newSocket = io("http://localhost:5001", {
        auth: {
          token: userInfo.token,
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      // --- Listen for incoming real-time events ---
      newSocket.on("newFoodShare", (data) => {
        setLastNotification({ type: "food", ...data });
      });

      newSocket.on("newTravelShare", (data) => {
        setLastNotification({ type: "travel", ...data });
      });

      setSocket(newSocket);

      // Disconnect when the component unmounts or user logs out
      return () => {
        newSocket.disconnect();
        console.log("Socket disconnected");
      };
    }
  }, [userInfo]);

  // --- Functions to send events ---
  const joinRoomSocket = (roomId) => {
    socket?.emit("joinRoom", roomId);
  };

  const sendFoodShare = (data) => {
    socket?.emit("foodShareRequest", data);
  };

  const sendTravelShare = (data) => {
    socket?.emit("travelShareRequest", data);
  };

  const value = {
    socket,
    lastNotification,
    joinRoomSocket,
    sendFoodShare,
    sendTravelShare,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
