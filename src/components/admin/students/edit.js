"use client";
import React, { useState, useEffect } from "react";

// Hardcoded categories for dropdown (sync with add.js)
const initialCategories = [
  { id: 1, title: "Breakfast" },
  { id: 2, title: "Lunch" },
  { id: 3, title: "Dinner" },
];

export default function EditStudent({ student }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    smsPhone: "",
    password: "",
    category: initialCategories[0]?.id || "",
    joiningDate: "",
    type: "new", // new or old
    dueRent: "",
  });

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || "",
        phone: student.phone || "",
        smsPhone: student.smsPhone || student.phone || "",
        password: student.password || student.phone || "",
        category: student.category || initialCategories[0]?.id || "",
        joiningDate: student.joiningDate || "",
        type: student.type || "new",
        dueRent: student.dueRent || "",
      });
    }
  }, [student]);

  // Sync smsPhone and password with phone if empty
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      phone: value,
      smsPhone: prev.smsPhone || value,
      password: prev.password || value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, type: value, dueRent: value === "old" ? prev.dueRent : "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...form });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18181b] py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#232329] p-8 rounded-lg shadow-md w-full max-w-lg space-y-6"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          Edit Student
        </h2>
        {/* New/Old selection */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">Student Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
          >
            <option value="new">New</option>
            <option value="old">Old</option>
          </select>
        </div>
        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter student name"
            required
          />
        </div>
        {/* Phone */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter phone number"
            required
          />
        </div>
        {/* SMS Phone */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">SMS Phone</label>
          <input
            type="tel"
            name="smsPhone"
            value={form.smsPhone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter SMS phone number"
            required
          />
        </div>
        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="text"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter password"
            required
          />
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            required
          >
            {initialCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        {/* Joining Date */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Joining Date</label>
          <input
            type="date"
            name="joiningDate"
            value={form.joiningDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            required
          />
        </div>
        {/* Current Due Rent (only if old) */}
        {form.type === "old" && (
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Current Due Rent</label>
            <input
              type="number"
              name="dueRent"
              value={form.dueRent}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
              placeholder="Enter current due rent"
              required={form.type === "old"}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
        >
          Update
        </button>
      </form>
    </div>
  );
}
