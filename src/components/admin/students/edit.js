"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { usePreventScroll } from '../../../hooks/usePreventScroll';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken') || localStorage.getItem('studentToken');
}

function getRole() {
  if (typeof window === 'undefined') return null;
  const adminData = localStorage.getItem('adminData');
  if (adminData) return 'admin';
  const studentData = localStorage.getItem('studentData');
  if (studentData) return 'student';
  return null;
}

export default function EditStudent({ student }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    smsPhone: "",
    password: "",
    categoryId: "",
    joiningDate: "",
    type: "new",
    dueRent: "",
    bookingAmount: 0, // NEW: booking amount
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  
  // Hook to prevent scroll wheel changes on number inputs
  const bookingAmountRef = usePreventScroll();
  const dueRentRef = usePreventScroll();

  useEffect(() => {
    setRole(getRole());
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        toast.error("Error loading categories");
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || "",
        phone: student.phone || "",
        smsPhone: student.smsPhone || student.phone || "",
        password: student.password || student.phone || "",
        categoryId: student.categoryId || "",
        joiningDate: student.joiningDate ? new Date(student.joiningDate).toISOString().split('T')[0] : "",
        type: student.type || "new",
        dueRent: student.dueRent || "",
        bookingAmount: student.bookingAmount || 0,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.phone || !form.categoryId || !form.joiningDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        const token = getToken();
        
        // Prepare update data based on role
        let updateData = {};
        if (role === 'admin') {
          updateData = {
            name: form.name,
            phone: form.phone,
            smsPhone: form.smsPhone,
            password: form.password,
            categoryId: form.categoryId,
            joiningDate: form.joiningDate,
            status: form.type === "old" ? "living" : "living",
            bookingAmount: form.bookingAmount
          };
        } else if (role === 'student') {
          // Students can only update certain fields
          updateData = {
            name: form.name,
            smsPhone: form.smsPhone,
            password: form.password,
          };
        }

        const res = await fetch(`/api/student/${student.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update student");
        }

        const data = await res.json();
        toast.success("Student updated successfully!");
        resolve("Student updated successfully");
      } catch (error) {
        reject(error.message || "Failed to update student");
      } finally {
        setLoading(false);
      }
    });

    toast.promise(updatePromise, {
      loading: 'Updating student...',
      success: 'Student updated successfully!',
      error: (err) => `Failed to update student: ${err}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#232329',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-lg space-y-6 border border-white/20 mx-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-white">
          Edit Student
        </h2>
        
        {/* New/Old selection */}
        <div className="mb-4">
          <label className="block mb-1 text-white font-medium">Student Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleTypeChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            disabled={role === 'student'}
          >
            <option value="new">New</option>
            <option value="old">Old</option>
          </select>
        </div>
        
        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 text-white">Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            placeholder="Enter student name"
            required
            disabled={loading}
          />
        </div>
        
        {/* Phone */}
        <div className="mb-4">
          <label className="block mb-1 text-white">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            placeholder="Enter phone number"
            required
            disabled={loading || role === 'student'}
          />
        </div>
        
        {/* SMS Phone */}
        <div className="mb-4">
          <label className="block mb-1 text-white">SMS Phone</label>
          <input
            type="tel"
            name="smsPhone"
            value={form.smsPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            placeholder="Enter SMS phone number"
            disabled={loading}
          />
        </div>
        
        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 text-white">Password</label>
          <input
            type="text"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            placeholder="Enter password"
            disabled={loading}
          />
        </div>
        
        {/* Category */}
        <div className="mb-4">
          <label className="block mb-1 text-white">Category *</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            required
            disabled={loading || role === 'student'}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        
        {/* Joining Date */}
        <div className="mb-4">
          <label className="block mb-1 text-white">Joining Date *</label>
          <input
            type="date"
            name="joiningDate"
            value={form.joiningDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            required
            disabled={loading || role === 'student'}
          />
        </div>

        {/* Booking Amount */}
        <div className="mb-4">
          <label className="block mb-1 text-white">Booking Amount</label>
          <input
            type="number"
            name="bookingAmount"
            value={form.bookingAmount}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
            placeholder="Enter booking amount"
            min="0"
            step="0.01"
            disabled={loading || role === 'student'}
            ref={bookingAmountRef}
          />
        </div>
        
        {/* Current Due Rent (only if old) */}
        {form.type === "old" && (
          <div className="mb-4">
            <label className="block mb-1 text-white">Current Due Rent</label>
            <input
              type="number"
              name="dueRent"
              value={form.dueRent}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
              placeholder="Enter current due rent"
              disabled={loading || role === 'student'}
              ref={dueRentRef}
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-3 rounded-2xl transition-all duration-200 shadow-lg"
        >
          {loading ? "Updating..." : "Update Student"}
        </button>
      </form>
    </div>
  );
}
