import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api"; // Import the centralized api instance
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // --- New function to update user info ---
  const updateUser = (newUserInfo) => {
    setUserInfo(newUserInfo);
    localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/login", {
        email,
        password,
      });
      updateUser(data); // Use helper
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/register", userData);
      updateUser(data); // Use helper
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const value = {
    userInfo,
    loading,
    error,
    login,
    register,
    logout,
    updateUser, // Export new function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
