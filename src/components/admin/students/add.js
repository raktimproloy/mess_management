"use client"

import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken') || localStorage.getItem('studentToken');
}

export default function AddStudent() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    smsPhone: "",
    password: "",
    category: "",
    joiningDate: "",
    type: "new",
    dueRent: "",
    currentMonthRentDue: 0,
    currentMonthExternalDue: 0,
    currentMonthAdvanceDue: 0,
    previousDue: 0,
    referenceId: "", // NEW: reference student ID
    discountId: "", // NEW: discount ID
  });
  const [categories, setCategories] = useState([]);
  const [livingStudents, setLivingStudents] = useState([]); // NEW: living students for reference
  const [discounts, setDiscounts] = useState([]); // NEW: discounts list
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories && data.categories.length > 0) {
          setForm((prev) => ({ ...prev, category: data.categories[0].id }));
        }
      } catch (error) {
        toast.error("Error loading categories");
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // NEW: Fetch living students for reference selection
  useEffect(() => {
    async function fetchLivingStudents() {
      try {
        const token = getToken();
        const res = await fetch("/api/student?status=living", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch living students");
        const data = await res.json();
        setLivingStudents(data.students || []);
      } catch (error) {
        toast.error("Error loading living students");
        setLivingStudents([]);
      }
    }
    fetchLivingStudents();
  }, []);

  // NEW: Fetch discounts
  useEffect(() => {
    async function fetchDiscounts() {
      try {
        const res = await fetch("/api/discount");
        if (!res.ok) throw new Error("Failed to fetch discounts");
        const data = await res.json();
        setDiscounts(data.discounts || []);
      } catch (error) {
        toast.error("Error loading discounts");
        setDiscounts([]);
      }
    }
    fetchDiscounts();
  }, []);

  // Sync smsPhone and password with phone if empty
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      phone: value,
      smsPhone: value, // Always sync with phone
      password: value,  // Always sync with phone
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value
    }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, type: value, dueRent: value === "old" ? prev.dueRent : "" }));
  };

  // NEW: Handle reference selection
  const handleReferenceChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ 
      ...prev, 
      referenceId: value,
      discountId: "" // Reset discount when reference changes
    }));
  };

  // NEW: Handle discount selection
  const handleDiscountChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      discountId: value
    }));
  };

  // NEW: Remove discount from selection
  const removeDiscount = () => {
    setForm((prev) => ({
      ...prev,
      discountId: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.phone || !form.category || !form.joiningDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const createPromise = new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        const token = getToken();
        // 1. Create the student
        const res = await fetch("/api/student", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            smsPhone: form.smsPhone,
            password: form.password,
            categoryId: form.category,
            joiningDate: form.joiningDate,
            status: form.type === "old" ? "living" : "living",
            referenceId: form.referenceId || null,
            discountId: form.discountId || null
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create student");
        }

        const data = await res.json();
        const newStudent = data.student;

        // 2. If old, create rent record for this student
        if (form.type === "old") {
          const rentRes = await fetch("/api/rent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              studentId: newStudent.id,
              categoryId: form.category,
              rentAmount: form.currentMonthRentDue,
              externalAmount: form.currentMonthExternalDue,
              advanceAmount: form.currentMonthAdvanceDue,
              previousDue: form.previousDue,
              status: "unpaid",
              // Optionally, set paid fields to 0
              rentPaid: 0,
              advancePaid: 0,
              externalPaid: 0,
              previousDuePaid: 0,
              paidDate: null,
              paidType: null
            })
          });
          if (!rentRes.ok) {
            const rentError = await rentRes.json();
            throw new Error(rentError.message || "Student created, but failed to create rent record");
          }
        }

        toast.success("Student created successfully!");
        // Reset form
        setForm({
          name: "",
          phone: "",
          smsPhone: "",
          password: "",
          category: categories.length > 0 ? categories[0].id : "",
          joiningDate: "",
          type: "new",
          dueRent: "",
          currentMonthRentDue: 0,
          currentMonthExternalDue: 0,
          currentMonthAdvanceDue: 0,
          previousDue: 0,
          referenceId: "",
          discountId: "",
        });
        resolve("Student created successfully");
      } catch (error) {
        reject(error.message || "Failed to create student");
      } finally {
        setLoading(false);
      }
    });

    toast.promise(createPromise, {
      loading: 'Creating student...',
      success: 'Student created successfully!',
      error: (err) => `Failed to create student: ${err}`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18181b] py-8">
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
        className="bg-white dark:bg-[#232329] p-8 rounded-lg shadow-md w-full max-w-lg space-y-6"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          Add Student
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
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter student name"
            required
            disabled={loading}
          />
        </div>
        
        {/* Phone */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter phone number"
            required
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
        
        {/* Category */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            required
            disabled={loading}
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
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Joining Date *</label>
          <input
            type="date"
            name="joiningDate"
            value={form.joiningDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            placeholder="Enter joining date"
            required
            disabled={loading}
          />
        </div>

        {/* Reference Selection */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Reference Student</label>
          <select
            name="referenceId"
            value={form.referenceId}
            onChange={handleReferenceChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
            disabled={loading}
          >
            <option value="">Select a reference student (optional)</option>
            {livingStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Discount Selection - only show if reference is selected */}
        {form.referenceId && (
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Discount for Reference Student</label>
            <select
              name="discountId"
              value={form.discountId}
              onChange={handleDiscountChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
              disabled={loading}
            >
              <option value="">Select a discount (optional)</option>
              {discounts.map((discount) => (
                <option key={discount.id} value={discount.id}>
                  {discount.title} - {discount.discountAmount}{discount.discountType === 'percent' ? '%' : '৳'}
                </option>
              ))}
            </select>
            
            {/* Show selected discount */}
            {form.discountId && (
              <div className="mt-2">
                <label className="block mb-1 text-sm text-gray-600 dark:text-gray-400">Selected Discount:</label>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {discounts.find(d => d.id == form.discountId)?.title} - {discounts.find(d => d.id == form.discountId)?.discountAmount}{discounts.find(d => d.id == form.discountId)?.discountType === 'percent' ? '%' : '৳'}
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 dark:text-blue-400 dark:hover:bg-blue-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Current Due Rent (only if old) */}
        {form.type === "old" && (
          <>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Current Month Rent Due</label>
              <input
                type="number"
                name="currentMonthRentDue"
                value={form.currentMonthRentDue}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
                placeholder="Enter current month rent due"
                min="0"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Current Month External Due</label>
              <input
                type="number"
                name="currentMonthExternalDue"
                value={form.currentMonthExternalDue}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
                placeholder="Enter current month external due"
                min="0"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Current Month Advance Due</label>
              <input
                type="number"
                name="currentMonthAdvanceDue"
                value={form.currentMonthAdvanceDue}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
                placeholder="Enter current month advance due"
                min="0"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Previous Due</label>
              <input
                type="number"
                name="previousDue"
                value={form.previousDue}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
                placeholder="Enter previous due"
                min="0"
                disabled={loading}
              />
            </div>
          </>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-md transition-colors"
        >
          {loading ? "Creating..." : "Create Student"}
        </button>
      </form>
    </div>
  );
}
