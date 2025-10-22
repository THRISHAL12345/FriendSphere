import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { FiUser, FiCamera, FiUpload } from "react-icons/fi";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { userInfo, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.put("/users/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data); // Update the global context and localStorage
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-900 mb-8"
      >
        Your Profile
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative w-40 h-40 mb-4">
            {userInfo.profilePictureUrl ? (
              <img
                src={userInfo.profilePictureUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser className="w-20 h-20 text-gray-500" />
              </div>
            )}
            <span className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-md">
              <FiCamera className="w-5 h-5" />
            </span>
          </div>

          <h2 className="text-2xl font-semibold">{userInfo.name}</h2>
          <p className="text-gray-600">{userInfo.email}</p>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="mt-8 w-full">
            <label
              htmlFor="picture-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Update your profile picture:
            </label>
            <input
              id="picture-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex justify-center items-center mt-4 px-4 py-3 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all duration-300 disabled:bg-primary-light"
            >
              <FiUpload className="mr-2" />
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
