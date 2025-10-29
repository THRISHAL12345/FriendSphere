const express = require("express");
const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors"); // Make sure this is imported
const connectDB = require("./config/db");

// Import jobs and initializers
const birthdayCheck = require("./jobs/birthdayChecker");
const initializeSocket = require("./socket/socketHandler");

// Import routes
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const photoRoutes = require("./routes/photoRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const todoRoutes = require("./routes/todoRoutes");
const pollRoutes = require("./routes/pollRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

birthdayCheck();

app.use(
  cors({
    origin: ["https://friendhub.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 2. Enable the built-in JSON body parser
app.use(express.json());

// A simple test route
app.get("/", (req, res) => {
  res.send("FriendSphere API is running...");
});

// --- API ROUTES ---
// (Must be after cors() and express.json())
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/polls", pollRoutes);
// --- ERROR HANDLING MIDDLEWARE ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
