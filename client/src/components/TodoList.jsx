import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const TodoItem = ({ todo, onToggle, onDelete, currentUserId }) => {
  const isCreator = todo.createdBy._id === currentUserId;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border ${
        todo.isCompleted ? "border-gray-200" : "border-primary/50"
      }`}
    >
      <div className="flex items-center">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
            todo.isCompleted
              ? "border-green-500 bg-green-500"
              : "border-gray-400 hover:border-primary"
          }`}
        >
          {todo.isCompleted && <FiCheck className="w-4 h-4 text-white" />}
        </button>
        <div>
          <p
            className={`font-medium ${
              todo.isCompleted ? "line-through text-gray-500" : "text-gray-800"
            }`}
          >
            {todo.text}
          </p>
          <p className="text-xs text-gray-400">
            Added by {todo.createdBy.name}
            {todo.isCompleted &&
              todo.completedBy &&
              ` | Completed by ${todo.completedBy.name}`}
          </p>
        </div>
      </div>
      {isCreator && (
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <FiTrash2 />
        </button>
      )}
    </motion.li>
  );
};

const TodoList = ({ roomId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();
  const { userInfo } = useAuth();

  // 1. Fetch initial todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/todos/room/${roomId}`);
        setTodos(data);
      } catch (err) {
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [roomId]);

  // 2. Listen for real-time updates
  useEffect(() => {
    if (socket) {
      // Add new todo
      socket.on("newTodo", (newTodo) => {
        if (newTodo.room === roomId) {
          setTodos((prevTodos) => [newTodo, ...prevTodos]);
        }
      });
      // Update existing todo
      socket.on("todoUpdated", (updatedTodo) => {
        if (updatedTodo.room === roomId) {
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo._id === updatedTodo._id ? updatedTodo : todo
            )
          );
        }
      });
      // Delete todo
      socket.on("todoDeleted", ({ todoId }) => {
        setTodos((prevTodos) =>
          prevTodos.filter((todo) => todo._id !== todoId)
        );
      });

      return () => {
        socket.off("newTodo");
        socket.off("todoUpdated");
        socket.off("todoDeleted");
      };
    }
  }, [socket, roomId]);

  // 3. Emit events to server
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoText.trim() === "" || !socket) return;
    socket.emit("createTodo", { roomId, text: newTodoText });
    setNewTodoText("");
  };

  const handleToggleTodo = (todoId) => {
    socket.emit("toggleTodo", { todoId });
  };

  const handleDeleteTodo = (todoId) => {
    socket.emit("deleteTodo", { todoId });
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const incompleteTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Add Task Form */}
      <form onSubmit={handleAddTodo} className="flex space-x-3">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="flex items-center justify-center px-5 py-3 text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all"
        >
          <FiPlus />
        </button>
      </form>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Incomplete */}
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
                  currentUserId={userInfo._id}
                />
              ))}
            </AnimatePresence>
            {incompleteTodos.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nothing to do!
              </p>
            )}
          </ul>
        </div>

        {/* Completed */}
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
                    currentUserId={userInfo._id}
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
