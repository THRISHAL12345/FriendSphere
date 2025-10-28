import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext"; // Import useAuth to check user ID
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiImage,
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiTrash2,
} from "react-icons/fi";
import UploadPhotoForm from "./UploadPhotoForm"; // Ensure this component exists and works

// --- Small Avatar Component ---
const PhotoUploaderAvatar = ({ src, name }) => (
  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 mr-2 border border-gray-300">
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" />
    ) : (
      <FiUser className="w-4 h-4 text-gray-500" />
    )}
  </div>
);

// --- Main Photo Gallery Component ---
const PhotoGallery = ({ roomId, members, roomOwnerId }) => {
  // Pass roomOwnerId as a prop if needed for delete logic
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const { userInfo } = useAuth(); // Get current logged-in user info

  // Function to fetch photos for the room
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/photos/room/${roomId}`);
      setPhotos(data);
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError(err.response?.data?.message || "Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  };

  // Fetch photos when the component mounts or roomId changes
  useEffect(() => {
    fetchPhotos();
  }, [roomId]);

  // Handle adding a new photo (update state or refetch)
  const handlePhotoUploaded = (newPhoto) => {
    setPhotos((prevPhotos) => [newPhoto, ...prevPhotos]); // Add to start of list
    // Optionally refetch for consistency: fetchPhotos();
  };

  // Handle deleting a photo
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }
    try {
      setError(null); // Clear previous errors
      await api.delete(`/photos/${photoId}`);
      // Remove the photo from the local state immediately for better UX
      setPhotos((prevPhotos) => prevPhotos.filter((p) => p._id !== photoId));
      // Close viewer if the deleted photo was selected
      if (
        selectedPhotoIndex !== null &&
        photos[selectedPhotoIndex]?._id === photoId
      ) {
        closeImageViewer();
      }
      // Optionally call fetchPhotos() again if needed, but filtering is faster
    } catch (err) {
      console.error("Delete photo error:", err);
      setError(err.response?.data?.message || "Failed to delete photo");
    }
  };

  // --- Image Viewer Functions ---
  const openImageViewer = (index) => {
    if (index >= 0 && index < photos.length) {
      setSelectedPhotoIndex(index);
    }
  };
  const closeImageViewer = () => setSelectedPhotoIndex(null);
  const goToNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };
  const goToPrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
    );
  };
  // ----------------------------

  // --- Loading and Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  // Display fetch errors prominently
  if (error && photos.length === 0)
    return <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>;

  // --- Organize Photos into Sections ---
  const memberMap = Array.isArray(members)
    ? members.reduce((acc, member) => {
        acc[member._id] = member;
        return acc;
      }, {})
    : {};

  const sections = {
    group: { name: "Group Photos", photos: [] },
    ...(Array.isArray(members)
      ? members.reduce((acc, member) => {
          acc[member._id] = { name: `${member.name}'s Photos`, photos: [] };
          return acc;
        }, {})
      : {}),
  };

  photos.forEach((photo) => {
    // Handle potential missing uploader data gracefully
    const sectionKey = photo.section || "group"; // Default to group if section is missing? Decide behavior.

    if (sections[sectionKey]) {
      sections[sectionKey].photos.push(photo);
    } else {
      // If a photo has a section ID that doesn't match a current member or 'group',
      // maybe put it in a default section or ignore? For now, we put in 'group'.
      console.warn(
        `Photo ${photo._id} has unknown section ${sectionKey}, adding to group.`
      );
      if (sections.group) sections.group.photos.push(photo);
    }
  });

  const sectionsWithPhotos = Object.entries(sections).filter(
    ([key, section]) => section.photos.length > 0
  );
  // ---------------------------------

  return (
    <div className="space-y-8">
      {/* Upload Form Component */}
      <UploadPhotoForm
        roomId={roomId}
        members={members}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {/* Display delete errors here */}
      {error && (
        <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded">
          {error}
        </p>
      )}

      {/* Message if no photos exist */}
      {photos.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">
          No photos uploaded yet. Be the first to share!
        </p>
      )}

      {/* Render each section with photos */}
      {sectionsWithPhotos.map(([key, section]) => (
        <div key={key}>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {section.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {section.photos.map((photo) => {
                const originalIndex = photos.findIndex(
                  (p) => p._id === photo._id
                );
                const uploader = photo.uploader
                  ? memberMap[photo.uploader._id] || photo.uploader
                  : null; // Handle populated/unpopulated uploader

                // Determine if the current user can delete this photo
                const canDelete =
                  userInfo &&
                  photo.uploader &&
                  photo.uploader._id === userInfo._id; // User uploaded it
                  // || (roomOwnerId && roomOwnerId === userInfo._id) // User is room owner (requires roomOwnerId prop)

                return (
                  <motion.div
                    key={photo._id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    className="relative group rounded-lg overflow-hidden shadow-md cursor-pointer aspect-w-1 aspect-h-1 w-full bg-gray-200"
                    onClick={() => openImageViewer(originalIndex)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.description || "Room photo"}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                    {/* Show uploader info */}
                    {uploader && (
                      <div className="absolute bottom-1 left-1 flex items-center p-1 bg-black/50 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <PhotoUploaderAvatar
                          src={uploader.profilePictureUrl}
                          name={uploader.name}
                        />
                        <span className="ml-1 truncate">{uploader.name}</span>
                      </div>
                    )}
                    {/* Show Delete Button */}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo._id);
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 bg-opacity-60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-opacity-90 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete photo"
                        aria-label="Delete photo"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Fullscreen Image Viewer Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageViewer} // Close on backdrop click
          >
            {/* Image Container */}
            <motion.div
              key={photos[selectedPhotoIndex]._id}
              className="relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <img
                src={photos[selectedPhotoIndex].imageUrl}
                alt="Full screen photo"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-xl"
              />
            </motion.div>

            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-40 transition-all z-[110]"
              aria-label="Close image viewer"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevPhoto();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-40 transition-all z-[110]"
                  aria-label="Previous image"
                >
                  <FiArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextPhoto();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-40 transition-all z-[110]"
                  aria-label="Next image"
                >
                  <FiArrowRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;
