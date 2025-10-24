# FriendSphere - Frontend

This directory contains the frontend for the FriendSphere application, built with React and Vite. It provides a modern, responsive, and interactive user interface for all the platform's features.

## ✨ Features

- **Modern UI:** A clean and intuitive user interface built with React and styled with Tailwind CSS.
- **Component-Based Architecture:** Organized into reusable and maintainable React components.
- **Real-Time Updates:** Leverages Socket.io to provide a live, interactive experience for chat and notifications.
- **Protected Routes:** Ensures that only authenticated users can access private pages.
- **Centralized State Management:** Uses React Context API for managing global state like authentication.
- **API Integration:** Communicates with the backend server through a centralized API module using Axios.

## 🛠️ Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **API Communication:** Axios
- **Real-Time:** Socket.io Client
- **Routing:** React Router

## 🚀 Local Setup

To run the frontend client locally, follow these steps:

1.  **Navigate to the client directory:**

    ```bash
    cd client
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

**Note:** Ensure the backend server is running before starting the frontend, as it needs to connect to the API.

## 📁 Project Structure

```
client/
├── public/         # Static assets
└── src/
    ├── api/        # Centralized API configuration (Axios)
    ├── assets/     # Images and other static assets
    ├── components/ # Reusable React components
    ├── context/    # React Context for global state
    ├── pages/      # Top-level page components
    ├── App.jsx     # Main application component
    ├── index.css   # Global CSS styles
    └── main.jsx    # Application entry point
```
