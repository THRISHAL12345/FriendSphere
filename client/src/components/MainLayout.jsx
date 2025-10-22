import React from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { FiLogOut, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

// --- Avatar Component ---
const Avatar = ({ src, name }) => (
  <Link to="/profile" className="flex items-center">
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-primary-light">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <FiUser className="w-6 h-6 text-gray-500" />
      )}
    </div>
    <span className="text-sm font-medium text-gray-700 hidden sm:block ml-3">
      Welcome, <span className="font-semibold">{name}!</span>
    </span>
  </Link>
);

const MainLayout = ({ children }) => {
  const { userInfo, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary">
                  FriendSphere
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-5">
              <Avatar src={userInfo?.profilePictureUrl} name={userInfo?.name} />
              <NotificationBell />
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
