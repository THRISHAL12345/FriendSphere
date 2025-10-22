import React, { useState, useEffect } from "react";
import api from "../api/api";
import AddExpenseForm from "./AddExpenseForm";
import { FiCheck, FiCopy } from "react-icons/fi";

const ExpenseTracker = ({ roomId, members }) => {
  const [expenses, setExpenses] = useState([]); // All expenses for the room (for potential history later)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState({
    moneyOwedToMe: [],
    moneyIOwe: [],
  }); // User's personal dashboard data

  // Function to fetch all necessary data
  const fetchData = async () => {
    // Keep showing loading unless it's the first load
    if (
      dashboard.moneyIOwe.length === 0 &&
      dashboard.moneyOwedToMe.length === 0
    )
      setLoading(true);
    setError(null);
    try {
      // Get all expenses specifically for *this room* (optional, could be used for history)
      // const roomExpensesRes = await api.get(`/expenses/room/${roomId}`);
      // setExpenses(roomExpensesRes.data);

      // Get the user's *personal* dashboard data across all rooms
      const dashboardRes = await api.get("/expenses/dashboard");
      setDashboard(dashboardRes.data);
    } catch (err) {
      console.error("Error fetching expense data:", err);
      setError(err.response?.data?.message || "Failed to fetch expense data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts or roomId changes
  useEffect(() => {
    fetchData();
  }, [roomId]);

  // Refetch data when a new expense is added in this room
  const handleExpenseAdded = (newExpense) => {
    fetchData();
  };

  // Handle settling an expense and refetch data
  const handleSettle = async (expenseId) => {
    try {
      setError(null); // Clear previous errors
      await api.put(`/expenses/${expenseId}/settle`);
      fetchData(); // Refetch data to update lists
    } catch (err) {
      console.error("Error settling expense:", err);
      setError(err.response?.data?.message || "Failed to settle expense");
    }
  };

  // Utility to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optional: Add feedback like a temporary message
        console.log("UPI ID copied!");
      })
      .catch((err) => {
        console.error("Failed to copy UPI ID:", err);
      });
  };

  // --- Loading and Error States ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  // Don't show full error for fetch, but maybe log it or show a subtle indicator
  // if (error) return <p className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>;

  // --- vvv THIS IS THE FIX vvv ---
  // Filter the dashboard data to only show debts related to the *current room*.
  // Compare the populated room's _id with the roomId from props.
  const roomMoneyOwedToMe = dashboard.moneyOwedToMe.filter(
    (exp) => exp.room && exp.room._id === roomId
  );
  const roomMoneyIOwe = dashboard.moneyIOwe.filter(
    (exp) => exp.room && exp.room._id === roomId
  );
  // --- ^^^ END OF FIX ^^^ ---

  return (
    <div className="space-y-6">
      {/* Form to add a new expense */}
      <AddExpenseForm
        roomId={roomId}
        members={members}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Display any settle/fetch errors here */}
      {error && (
        <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded">
          {error}
        </p>
      )}

      {/* Expense Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Card: Money You are Owed --- */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-secondary mb-4">
            You Are Owed
          </h3>
          {roomMoneyOwedToMe.length === 0 ? (
            <p className="text-sm text-gray-500">
              No pending amounts owed to you in this room.
            </p>
          ) : (
            <ul className="space-y-4">
              {roomMoneyOwedToMe.map((exp) => (
                <li
                  key={exp._id}
                  className="p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {/* --- vvv CURRENCY FIX vvv --- */}
                      <p className="text-lg font-semibold text-gray-800">
                        ₹{exp.amount.toFixed(2)}
                      </p>
                      {/* --- ^^^ CURRENCY FIX ^^^ --- */}
                      <p className="text-sm text-gray-600">
                        From:{" "}
                        <span className="font-medium">
                          {exp.payee?.name || "Unknown User"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {exp.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettle(exp._id)}
                      className="flex items-center px-3 py-1 text-xs font-medium text-white bg-secondary rounded-full shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
                      aria-label={`Settle amount owed by ${exp.payee?.name}`}
                    >
                      <FiCheck className="mr-1 h-3 w-3" />
                      Settle
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Card: Money You Owe --- */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-accent mb-4">You Owe</h3>
          {roomMoneyIOwe.length === 0 ? (
            <p className="text-sm text-gray-500">
              You don't owe anyone in this room.
            </p>
          ) : (
            <ul className="space-y-4">
              {roomMoneyIOwe.map((exp) => (
                <li
                  key={exp._id}
                  className="p-4 bg-pink-50 rounded-lg border border-pink-200"
                >
                  {/* --- vvv CURRENCY FIX vvv --- */}
                  <p className="text-lg font-semibold text-gray-800">
                    ₹{exp.amount.toFixed(2)}
                  </p>
                  {/* --- ^^^ CURRENCY FIX ^^^ --- */}
                  <p className="text-sm text-gray-600">
                    To:{" "}
                    <span className="font-medium">
                      {exp.payer?.name || "Unknown User"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {exp.description}
                  </p>
                  {/* UPI ID Section */}
                  {exp.payer?.upiId && (
                    <div className="mt-3 p-2 bg-gray-100 rounded-md flex justify-between items-center">
                      <span className="text-sm font-mono text-gray-700 break-all">
                        {exp.payer.upiId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(exp.payer.upiId)}
                        className="text-gray-500 hover:text-primary transition-colors ml-2 flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                        title="Copy UPI ID"
                        aria-label="Copy UPI ID"
                      >
                        <FiCopy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
