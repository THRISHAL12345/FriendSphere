import React, { useState, useEffect } from "react";
import api from "../api/api";
import UploadPhotoForm from "./UploadPhotoForm"; // Assuming this component is correct
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiArrowLeft, FiArrowRight, FiUser } from "react-icons/fi"; // Add FiUser for default avatar

// --- Small Avatar Component (similar to other components) ---
const PhotoUploaderAvatar = ({ src, name }) => (
  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 mr-2 border border-gray-300">
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" />
    ) : (
      <FiUser className="w-4 h-4 text-gray-500" />
    )}
  </div>
);

const PhotoGallery = ({ roomId, members }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null); // For fullscreen viewer

  const fetchPhotos = async () => {
    try {
      // Reset state for refetch
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/photos/room/${roomId}`);
      setPhotos(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [roomId]); // Fetch on component load or if roomId changes

  const handlePhotoUploaded = (newPhoto) => {
    // Add new photo optimistically or refetch
    setPhotos((prevPhotos) => [newPhoto, ...prevPhotos]);
    // Or uncomment below to refetch for guaranteed consistency
    // fetchPhotos();
  };

  const openImageViewer = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closeImageViewer = () => {
    setSelectedPhotoIndex(null);
  };

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

  // --- Loading and Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  if (error)
    return <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>;

  // --- Organize photos into sections ---
  // Ensure 'members' is an array before using 'forEach'
  const memberMap = Array.isArray(members)
    ? members.reduce((acc, member) => {
        acc[member._id] = member; // Map member ID to member object
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
    // Check if the section exists before pushing
    if (sections[photo.section]) {
      sections[photo.section].photos.push(photo);
    } else if (photo.section === "group" && sections.group) {
      // Fallback for 'group' explicitly
      sections.group.photos.push(photo);
    }
    // You might want a fallback for photos whose section doesn't match any member or 'group'
  });
  // Filter out sections that might have been created but have no photos
  const sectionsWithPhotos = Object.entries(sections).filter(
    ([key, section]) => section.photos.length > 0
  );
  // --- End Organization ---

  return (
    <div className="space-y-8">
      <UploadPhotoForm
        roomId={roomId}
        members={members}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {photos.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">
          No photos uploaded yet. Be the first to share!
        </p>
      )}

      {sectionsWithPhotos.map(([key, section]) => (
        <div key={key}>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {section.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {section.photos.map((photo) => {
                // Find the index in the original, flat 'photos' array for the viewer
                const originalIndex = photos.findIndex(
                  (p) => p._id === photo._id
                );
                const uploader = memberMap[photo.uploader]; // Get uploader info

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
                      loading="lazy" // Improve performance
                    />
                    {/* Optional: Show uploader avatar/name */}
                    {uploader && (
                      <div className="absolute bottom-1 left-1 flex items-center p-1 bg-black/40 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <PhotoUploaderAvatar
                          src={uploader.profilePictureUrl}
                          name={uploader.name}
                        />
                        <span className="ml-1">{uploader.name}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Fullscreen Image Viewer Modal (Using AnimatePresence for exit animation) */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageViewer} // Close on backdrop click
          >
            {/* Image Container */}
            <motion.div
              key={photos[selectedPhotoIndex]._id} // Key changes trigger animation
              className="relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
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
              className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-40 transition-all z-10"
              aria-label="Close image viewer"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Navigation Buttons (Only if more than one photo) */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevPhoto();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-40 transition-all z-10"
                  aria-label="Previous image"
                >
                  <FiArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextPhoto();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-40 transition-all z-10"
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
