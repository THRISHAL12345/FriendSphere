import React, { useState } from "react";
import api from "../api/api";

const UploadPhotoForm = ({ roomId, members, onPhotoUploaded }) => {
  const [file, setFile] = useState(null);
  const [section, setSection] = useState("group"); // Default to 'group'
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    // We must use FormData for file uploads
    const formData = new FormData();
    formData.append("image", file);
    formData.append("section", section);
    formData.append("description", description);

    try {
      const { data } = await api.post(
        `/photos/room/${roomId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onPhotoUploaded(data); // Pass the new photo to the parent
      // Reset form
      setFile(null);
      setSection("group");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-md bg-gray-50 mb-6"
    >
      <h3 className="text-lg font-medium text-gray-900">Upload a Photo</h3>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700"
        >
          Photo
        </label>
        <input
          type="file"
          id="file"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="section"
          className="block text-sm font-medium text-gray-700"
        >
          Upload to Section
        </label>
        <select
          id="section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="group">Group Photos</option>
          {members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}'s Section
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default UploadPhotoForm;
