import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { motion } from "framer-motion";
import { FiLock, FiSend } from "react-icons/fi";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get token from URL (e.g., /reset-password/abc123xyz)
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.patch(`/users/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setMessage(
        data.message || "Password reset successful! Redirecting to login..."
      );
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Token might be invalid or expired."
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
          <h2 className="text-3xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className="text-sm text-center text-green-600">{message}</p>
          )}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !!message} // Disable after success message shown
            className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all duration-300 disabled:bg-primary-light"
          >
            {loading ? "Resetting..." : "Reset Password"}
            {!loading && <FiSend className="ml-2" />}
          </button>
          <p className="mt-6 text-sm text-center text-gray-600">
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
