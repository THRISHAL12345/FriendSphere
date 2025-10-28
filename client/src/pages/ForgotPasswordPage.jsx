import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api"; // Use unauthenticated axios for this if needed, but our helper works too
import { motion } from "framer-motion";
import { FiMail, FiSend } from "react-icons/fi";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      // Note: We use the base axios instance directly here if needed,
      // but our api helper should work even without a token for public routes.
      const { data } = await api.post("/users/forgot-password", { email });
      setMessage(
        data.message || "If an account exists, a reset link has been sent."
      );
    } catch (err) {
      // Use the error message from the backend if available
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Your Email Address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className="text-sm text-center text-green-600">{message}</p>
          )}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all duration-300 disabled:bg-primary-light"
          >
            {loading ? "Sending..." : "Send Reset Link"}
            {!loading && <FiSend className="ml-2" />}
          </button>

          <p className="mt-6 text-sm text-center text-gray-600">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
