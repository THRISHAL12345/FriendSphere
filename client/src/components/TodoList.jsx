import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// --- Single Todo Item Component ---
// Renders one item in the list with check/delete buttons.
const TodoItem = ({ todo, onToggle, onDelete, currentUserId }) => {
  // Check if the current user is the creator of this todo
  // Use optional chaining for safety in case createdBy is missing temporarily
  const isCreator = todo.createdBy?._id === currentUserId;

  return (
    <motion.li
      layout // Animates position changes smoothly
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }} // Slide out on exit
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border ${
        todo.isCompleted ? "border-gray-200 opacity-70" : "border-primary/50" // Style completed items
      }`}
    >
      <div className="flex items-center flex-grow min-w-0 mr-2">
        {" "}
        {/* Allow text to wrap */}
        {/* Check Button */}
        <button
          onClick={onToggle} // Trigger toggle action
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-150 ease-in-out ${
            todo.isCompleted
              ? "border-green-500 bg-green-500"
              : "border-gray-400 hover:border-primary"
          }`}
          aria-label={
            todo.isCompleted
              ? "Mark task as incomplete"
              : "Mark task as complete"
          }
        >
          {todo.isCompleted && <FiCheck className="w-4 h-4 text-white" />}
        </button>
        {/* Task Text and Details */}
        <div className="min-w-0">
          {" "}
          {/* Ensure text wraps */}
          <p
            className={`font-medium break-words ${
              // Allow long words to break
              todo.isCompleted ? "line-through text-gray-500" : "text-gray-800"
            }`}
          >
            {todo.text}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Added by {todo.createdBy?.name || "Unknown User"}{" "}
            {/* Handle missing creator */}
            {todo.isCompleted &&
              todo.completedBy &&
              ` | Completed by ${todo.completedBy.name}`}
          </p>
        </div>
      </div>
      {/* Delete Button (only shown to creator) */}
      {isCreator && (
        <button
          onClick={onDelete} // Trigger delete action
          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
          aria-label="Delete task"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}
    </motion.li>
  );
};

// --- Main Todo List Component ---
// Manages fetching, state, socket events, and rendering for the To-Do feature.
const TodoList = ({ roomId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();
  const { userInfo } = useAuth();

  // 1. Fetch initial todos via API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/todos/room/${roomId}`);
        setTodos(data);
      } catch (err) {
        console.error("Error fetching todos:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [roomId]); // Refetch if roomId changes

  // 2. Set up socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleNewTodo = (newTodo) => {
        if (newTodo.room === roomId) {
          // Add new todo to the beginning of the list
          setTodos((prevTodos) => [newTodo, ...prevTodos]);
        }
      };
      const handleTodoUpdate = (updatedTodo) => {
        if (updatedTodo.room === roomId) {
          // Update the specific todo in the list
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo._id === updatedTodo._id ? updatedTodo : todo
            )
          );
        }
      };
      const handleTodoDelete = ({ todoId }) => {
        // Remove the todo from the list
        setTodos((prevTodos) =>
          prevTodos.filter((todo) => todo._id !== todoId)
        );
      };

      // Register listeners
      socket.on("newTodo", handleNewTodo);
      socket.on("todoUpdated", handleTodoUpdate);
      socket.on("todoDeleted", handleTodoDelete);

      // Cleanup listeners on component unmount or socket change
      return () => {
        socket.off("newTodo", handleNewTodo);
        socket.off("todoUpdated", handleTodoUpdate);
        socket.off("todoDeleted", handleTodoDelete);
      };
    } else {
      console.warn(
        "TodoList: Socket not available, real-time updates disabled."
      );
      // Optionally set an error state if socket is crucial
      // setError("Real-time connection failed. Please refresh.");
    }
  }, [socket, roomId]); // Rerun if socket instance or roomId changes

  // 3. Emit events to server via socket
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoText.trim() === "" || !socket) {
      if (!socket) setError("Not connected to server. Cannot add task.");
      return;
    }
    setError(null); // Clear previous errors
    socket.emit("createTodo", { roomId, text: newTodoText });
    setNewTodoText(""); // Clear input after sending
  };

  const handleToggleTodo = (todoId) => {
    if (!socket) {
      setError("Not connected to server. Cannot update task.");
      return;
    }
    setError(null);
    console.log(`Emitting toggleTodo for ID: ${todoId}`); // Debug log
    socket.emit("toggleTodo", { todoId });
  };

  const handleDeleteTodo = (todoId) => {
    if (!socket) {
      setError("Not connected to server. Cannot delete task.");
      return;
    }
    setError(null);
    // Add confirmation before deleting
    if (window.confirm("Are you sure you want to delete this task?")) {
      console.log(`Emitting deleteTodo for ID: ${todoId}`); // Debug log
      socket.emit("deleteTodo", { todoId });
    }
  };

  // --- Render Loading/Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  // Display error prominently only if loading failed initially and list is empty
  if (error && todos.length === 0)
    return <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>;

  // Separate todos into incomplete and completed lists
  const incompleteTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  // --- Render Main Content ---
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Add Task Form */}
      <form onSubmit={handleAddTodo} className="flex space-x-3 items-center">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FiPlus className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new task..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="New task description"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center px-5 py-3 text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          disabled={newTodoText.trim() === ""} // Disable if input is empty
          aria-label="Add task"
        >
          <FiPlus />
        </button>
      </form>

      {/* Display non-critical errors (e.g., socket connection issues) */}
      {error && (
        <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded">
          {error}
        </p>
      )}

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Incomplete Tasks Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            To-Do ({incompleteTodos.length})
          </h3>
          <ul className="space-y-3">
            <AnimatePresence>
              {incompleteTodos.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onToggle={() => handleToggleTodo(todo._id)}
                  onDelete={() => handleDeleteTodo(todo._id)}
                  currentUserId={userInfo?._id} // Pass current user ID
                />
              ))}
            </AnimatePresence>
            {/* Message if no incomplete tasks */}
            {incompleteTodos.length === 0 &&
              todos.length > 0 && ( // Show only if there ARE completed tasks
                <p className="text-sm text-gray-500 text-center py-4">
                  All tasks completed! 🎉
                </p>
              )}
            {/* Message if no tasks at all */}
            {todos.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center py-4">
                No tasks added yet.
              </p>
            )}
          </ul>
        </div>

        {/* Completed Tasks Section (only shown if there are completed tasks) */}
        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Completed ({completedTodos.length})
            </h3>
            <ul className="space-y-3">
              <AnimatePresence>
                {completedTodos.map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onToggle={() => handleToggleTodo(todo._id)}
                    onDelete={() => handleDeleteTodo(todo._id)}
                    currentUserId={userInfo?._id}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
