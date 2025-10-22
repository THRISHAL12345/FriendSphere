import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiCalendar,
  FiCreditCard,
  FiArrowRight,
} from "react-icons/fi";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    phoneNumber: "",
    upiId: "",
  });
  const [message, setMessage] = useState("");
  const { register, loading, error } = useAuth();
  const {
    name,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    phoneNumber,
    upiId,
  } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setMessage("");
    register({ name, email, password, dateOfBirth, phoneNumber, upiId });
  };

  const renderInput = (name, type, placeholder, icon) => (
    <div className="relative">
      {React.createElement(icon, {
        className: "absolute top-1/2 left-3 -translate-y-1/2 text-gray-400",
      })}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        value={formData[name]}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="flex w-full max-w-5xl h-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Column (Branding) */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/3 bg-gradient-to-br from-primary to-accent text-white p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-4">Join Us!</h1>
            <p className="text-lg text-primary-light">
              Create your account to start sharing moments and managing expenses
              with your friends.
            </p>
          </motion.div>
        </div>

        {/* Right Column (Form) */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Create Your Account
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput("name", "text", "Full Name", FiUser)}
                {renderInput("email", "email", "Email Address", FiMail)}
                {renderInput("password", "password", "Password", FiLock)}
                {renderInput(
                  "confirmPassword",
                  "password",
                  "Confirm Password",
                  FiLock
                )}
                {renderInput(
                  "dateOfBirth",
                  "date",
                  "Date of Birth",
                  FiCalendar
                )}
                {renderInput("phoneNumber", "tel", "Phone Number", FiPhone)}
              </div>

              {renderInput(
                "upiId",
                "text",
                "UPI ID (e.g., yourname@upi)",
                FiCreditCard
              )}

              {(error || message) && (
                <p className="text-sm text-center text-red-500">
                  {message || error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all duration-300 disabled:bg-primary-light"
              >
                {loading ? "Creating Account..." : "Sign Up"}
                {!loading && <FiArrowRight className="ml-2" />}
              </button>

              <p className="mt-6 text-sm text-center text-gray-600">
                Already have an account?{" "}
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
      </div>
    </div>
  );
};

export default RegisterPage;
