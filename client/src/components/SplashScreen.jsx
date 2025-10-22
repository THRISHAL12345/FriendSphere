import React from "react";

const SplashScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-600">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">FriendSphere</h1>
        <p className="text-lg">Connecting you with your friends.</p>
        <div className="mt-8 animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
