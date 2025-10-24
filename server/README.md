# FriendSphere - Backend

This directory contains the backend server for the FriendSphere application. It's built with Node.js and Express.js, and it provides a RESTful API for all frontend functionalities.

## ✨ Features

- **RESTful API:** A complete API for managing users, rooms, messages, expenses, todos, photos, and polls.
- **WebSocket Integration:** Real-time communication powered by Socket.io for chat and notifications.
- **Secure Authentication:** JWT-based authentication to protect user data and secure endpoints.
- **MongoDB Integration:** Uses Mongoose for elegant and straightforward database interactions.
- **Cloudinary Integration:** Handles image uploads and storage seamlessly.
- **Automated Jobs:** Includes scheduled jobs, such as checking for user birthdays.

## 🛠️ Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Real-Time:** Socket.io
- **Authentication:** JSON Web Tokens (JWT)
- **Image Storage:** Cloudinary
- **Environment Variables:** `dotenv`

## 🚀 Local Setup

To run the backend server locally, follow these steps:

1.  **Navigate to the server directory:**

    ```bash
    cd server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the `server` directory and add the following environment variables. Replace the placeholder values with your actual credentials.

    ```env
    NODE_ENV=development
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

The server will start on `http://localhost:5001`.

## 📁 Project Structure

```
server/
├── config/         # Database and Cloudinary configuration
├── controllers/    # Request handling logic
├── jobs/           # Scheduled tasks
├── middleware/     # Custom middleware (auth, error handling)
├── models/         # Mongoose data models
├── routes/         # API route definitions
├── socket/         # Socket.io event handlers
├── uploads/        # Directory for local file uploads
├── utils/          # Utility functions (e.g., token generation)
└── server.js       # Main server entry point
```
