import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { FiFileText, FiDollarSign, FiUser, FiSend } from "react-icons/fi"; // <-- Import icons

const AddExpenseForm = ({ roomId, members, onExpenseAdded }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useAuth();

  const otherMembers = members.filter((member) => member._id !== userInfo._id);

  useEffect(() => {
    if (otherMembers.length > 0 && !payeeId) {
      setPayeeId(otherMembers[0]._id);
    }
  }, [members, otherMembers, payeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payeeId) {
      setError("Please select a member to pay for.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post(`/expenses/room/${roomId}`, {
        description,
        amount: parseFloat(amount),
        payeeId,
      });
      onExpenseAdded(data);
      setDescription("");
      setAmount("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  if (otherMembers.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p className="text-sm text-gray-600">
          You must have at least one other member in the room to add an expense.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 border rounded-lg bg-white shadow-sm"
    >
      <h3 className="text-xl font-semibold text-gray-900">Log a New Expense</h3>
      <p className="text-sm text-gray-500">
        Log a payment you made on behalf of someone else.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Description Input */}
      <div className="relative">
        <FiFileText className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this for? (e.g., Dinner)"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Amount Input */}
      <div className="relative">
        <FiDollarSign className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (e.g., 250)"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Payee Select */}
      <div className="relative">
        <FiUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <select
          id="payeeId"
          value={payeeId}
          onChange={(e) => setPayeeId(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          {otherMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark transition-all duration-300 disabled:bg-primary-light"
      >
        {loading ? "Adding..." : "Add Expense"}
        {!loading && <FiSend className="ml-2" />}
      </button>
    </form>
  );
};

export default AddExpenseForm;
