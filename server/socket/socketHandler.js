const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/Room");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const Todo = require("../models/Todo");
const Poll = require("../models/Poll");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow connections from any origin (adjust for production)
      methods: ["GET", "POST"],
    },
  });

  // Middleware: Authenticate socket connection using JWT
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select("-password");
      if (!socket.user) {
        return next(new Error("Authentication error: User not found"));
      }
      next(); // Authentication successful
    } catch (err) {
      next(new Error("Authentication error: Token is invalid"));
    }
  });

  // Handle new connections
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} - User: ${socket.user.name}`);

    // Join a specific room's socket channel
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.user.name} joined socket room ${roomId}`);
    });

    // --- Food Share Event ---
    socket.on("foodShareRequest", async (data) => {
      const { roomId, vendor, message } = data;
      const eventData = {
        type: "food", // Added type for frontend toast
        from: socket.user.name,
        vendor,
        message,
        timestamp: new Date(),
      };

      // 1. Broadcast real-time toast to online users in the room
      socket.to(roomId).emit("newFoodShare", eventData);

      // 2. Save notification to database for offline users
      try {
        const room = await Room.findById(roomId);
        if (room) {
          const membersToNotify = room.members.filter(
            (memberId) => memberId.toString() !== socket.user._id.toString()
          );
          const notificationMessage = `🍔 Food Share: ${socket.user.name} is ordering from ${vendor} ("${message}")`;
          for (const memberId of membersToNotify) {
            await Notification.create({
              recipient: memberId,
              message: notificationMessage,
            });
          }
        }
      } catch (err) {
        console.error("Failed to save food share notification:", err);
      }
    });

    // --- Travel Share Event ---
    socket.on("travelShareRequest", async (data) => {
      const { roomId, fromLocation, toLocation } = data;
      const eventData = {
        type: "travel", // Added type for frontend toast
        from: socket.user.name,
        fromLocation,
        toLocation,
        timestamp: new Date(),
      };

      // 1. Broadcast real-time toast to online users in the room
      socket.to(roomId).emit("newTravelShare", eventData);

      // 2. Save notification to database for offline users
      try {
        const room = await Room.findById(roomId);
        if (room) {
          const membersToNotify = room.members.filter(
            (memberId) => memberId.toString() !== socket.user._id.toString()
          );
          const notificationMessage = `🚗 Travel Share: ${socket.user.name} is going from ${fromLocation} to ${toLocation}`;
          for (const memberId of membersToNotify) {
            await Notification.create({
              recipient: memberId,
              message: notificationMessage,
            });
          }
        }
      } catch (err) {
        console.error("Failed to save travel share notification:", err);
      }
    });

    // --- Chat Message Event ---
    socket.on("sendMessage", async (data) => {
      const { roomId, text } = data;
      try {
        const message = new Message({
          room: roomId,
          sender: socket.user._id,
          text: text,
        });
        const savedMessage = await message.save();
        const populatedMessage = await savedMessage.populate(
          "sender",
          "name profilePictureUrl"
        );

        // Broadcast the saved message to everyone in the room (including sender)
        io.to(roomId).emit("newMessage", populatedMessage);
      } catch (err) {
        console.error("Error saving or broadcasting message:", err);
        // Optionally emit an error back to the sender
        // socket.emit('messageError', { message: 'Failed to send message' });
      }
    });

    // --- To-Do List Events ---
    socket.on("createTodo", async (data) => {
      try {
        const { roomId, text } = data;
        const todo = new Todo({
          room: roomId,
          text: text,
          createdBy: socket.user._id,
        });
        const savedTodo = await todo.save();
        const populatedTodo = await savedTodo.populate(
          "createdBy",
          "name profilePictureUrl"
        );
        io.to(roomId).emit("newTodo", populatedTodo); // Broadcast new todo
      } catch (err) {
        console.error("Error creating todo:", err);
      }
    });

    socket.on("toggleTodo", async (data) => {
      try {
        const { todoId } = data;
        const todo = await Todo.findById(todoId);
        if (!todo) return;

        todo.isCompleted = !todo.isCompleted;
        todo.completedBy = todo.isCompleted ? socket.user._id : undefined;

        const savedTodo = await todo.save();
        const populatedTodo = await savedTodo.populate([
          { path: "createdBy", select: "name profilePictureUrl" },
          { path: "completedBy", select: "name" }, // Populate completer details
        ]);
        io.to(todo.room.toString()).emit("todoUpdated", populatedTodo); // Broadcast updated todo
      } catch (err) {
        console.error("Error toggling todo:", err);
      }
    });

    socket.on("deleteTodo", async (data) => {
      try {
        const { todoId } = data;
        const todo = await Todo.findByIdAndDelete(todoId);
        if (todo) {
          io.to(todo.room.toString()).emit("todoDeleted", { todoId }); // Broadcast deleted ID
        }
      } catch (err) {
        console.error("Error deleting todo:", err);
      }
    });

    // --- Poll Events ---
    socket.on("createPoll", async (data) => {
      try {
        const { roomId, question, options } = data;
        const poll = new Poll({
          room: roomId,
          question: question,
          createdBy: socket.user._id,
          options: options.map((text) => ({ text: text, votes: [] })),
        });
        const savedPoll = await poll.save();
        const populatedPoll = await savedPoll.populate(
          "createdBy",
          "name profilePictureUrl"
        );
        io.to(roomId).emit("newPoll", populatedPoll); // Broadcast new poll
      } catch (err) {
        console.error("Error creating poll:", err);
      }
    });

    socket.on("voteOnPoll", async (data) => {
      try {
        const { pollId, optionId } = data;
        const userId = socket.user._id;

        const poll = await Poll.findById(pollId);
        if (!poll) return;

        // Remove user's vote from all options first
        poll.options.forEach((opt) => {
          opt.votes.pull(userId);
        });

        // Add user's vote to the selected option
        const targetOption = poll.options.id(optionId);
        if (targetOption) {
          targetOption.votes.push(userId);
        }

        const savedPoll = await poll.save();
        const populatedPoll = await savedPoll
          .populate("createdBy", "name profilePictureUrl")
          .populate("options.votes", "name profilePictureUrl"); // Populate voters

        io.to(poll.room.toString()).emit("pollUpdated", populatedPoll); // Broadcast updated poll
      } catch (err) {
        console.error("Error voting on poll:", err);
      }
    });

    // Add this inside io.on('connection', ...)
    socket.on("deletePoll", async (data) => {
      try {
        const { pollId } = data;
        const poll = await Poll.findById(pollId);
        if (!poll) return; // Poll already deleted or doesn't exist

        // Security Check (redundant if API is used, but good practice)
        const room = await Room.findById(poll.room);
        if (!room) return;
        if (
          poll.createdBy.toString() !== socket.user._id.toString() &&
          room.owner.toString() !== socket.user._id.toString()
        ) {
          // Optionally emit an error back to sender
          return;
        }

        await poll.deleteOne();
        // Broadcast the ID of the deleted poll
        io.to(poll.room.toString()).emit("pollDeleted", { pollId });
      } catch (err) {
        console.error("Error deleting poll via socket:", err);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
