"use client"
import React, { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function StudentModal({ open, onClose, student, mode, categories, onSave }) {
  const [form, setForm] = useState({ ...student });
  const [showNewJoining, setShowNewJoining] = useState(false);
  useEffect(() => {
    setForm({ ...student });
    setShowNewJoining(false);
  }, [student, open]);

  useEffect(() => {
    if (mode === 'edit' && student && student.status === 'leave' && form.status === 'living') {
      setShowNewJoining(true);
    } else {
      setShowNewJoining(false);
    }
  }, [form.status, mode, student]);

  if (!open) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, showNewJoining ? form.newJoiningDate : undefined);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/20 mx-4">
        <h2 className="text-xl font-semibold mb-6 text-white">
          {mode === 'edit' ? 'Edit Student' : 'Student Details'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input name="name" value={form.name || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input name="phone" value={form.phone || ''} disabled className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white backdrop-blur-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMS Phone</label>
            <input name="smsPhone" value={form.smsPhone || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select name="categoryId" value={form.categoryId || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select name="status" value={form.status || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="living">Living</option>
              <option value="leave">Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Joining Date</label>
            <input name="joiningDate" type="date" value={form.joiningDate ? form.joiningDate.split('T')[0] : ''} onChange={handleChange} disabled className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white backdrop-blur-lg" />
          </div>
          {showNewJoining && (
            <div>
              <label className="block text-sm font-medium text-yellow-300 mb-2">New Joining Date</label>
              <input name="newJoiningDate" type="date" value={form.newJoiningDate || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-yellow-500/30 rounded-2xl bg-white/10 text-yellow-200 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          )}
          {mode === 'edit' && (
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200">Save</button>
            </div>
          )}
          {mode === 'view' && (
            <div className="flex justify-end pt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200">Close</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function getRole() {
  if (typeof window === 'undefined') return null;
  const adminData = localStorage.getItem('adminData');
  if (adminData) return 'admin';
  const studentData = localStorage.getItem('studentData');
  if (studentData) return 'student';
  return null;
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken') || localStorage.getItem('studentToken');
}

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: "living",
    category: "",
    search: "",
  });
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // Fixed page size
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [expandedCards, setExpandedCards] = useState(new Set());
  // Add a state for search input
  const [searchInput, setSearchInput] = useState("");

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Load students from API
  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: filters.status,
        category: filters.category,
        search: filters.search,
      });
      const res = await fetch(`/api/student?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Error loading students");
      toast.error(err.message || "Error loading students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setCategories([]);
      toast.error("Error loading categories");
    }
  };

  useEffect(() => {
    setRole(getRole());
    fetchStudents();
    fetchCategories();
  }, [page, filters.status, filters.category, filters.search]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name !== "search") setPage(1);
  };
  // Update the search input field
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };
  // Update the search filter only on button click
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setPage(1);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const toggleCardExpansion = (studentId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedCards(newExpanded);
  };

  // Add/Edit/Delete handlers
  const handleAddNew = () => {
    router.push('/admin/students/create');
  };
  
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setModalMode('edit');
    setModalOpen(true);
  };
  
  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student ${student.name}?`)) return;
    
    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        const token = getToken();
        const res = await fetch(`/api/student/${student.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete student");
        setSuccess("Student deleted successfully");
        await fetchStudents(); // Refresh the list
        resolve("Student deleted successfully");
      } catch (err) {
        setError(err.message || "Error deleting student");
        reject(err.message || "Error deleting student");
      } finally {
        setLoading(false);
      }
    });

    toast.promise(deletePromise, {
      loading: 'Deleting student...',
      success: 'Student deleted successfully!',
      error: 'Failed to delete student',
    });
  };

  const handleSave = async (formData, newJoiningDate) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const url = `/api/student/${selectedStudent?.id || ''}`;
      const method = selectedStudent ? 'PUT' : 'POST';
      const body = {
        ...formData,
        ...(newJoiningDate ? { joiningDate: newJoiningDate } : {}),
      };

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save student");
      }
      setSuccess("Student saved successfully!");
      setModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      setError(err.message || "Error saving student");
      toast.error(err.message || "Error saving student");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'living': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'leave': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount) => {
    return `৳${amount?.toLocaleString() || 0}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
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

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Student Management</h1>
              <p className="text-gray-300 text-sm mt-1">Manage all students in the system</p>
            </div>
            {role === 'admin' && (
              <button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-6 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                Add New
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="living">Living</option>
                  <option value="leave">Leave</option>
                  <option value="">All</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <label className="block text-sm font-medium text-white mb-3">Search Students</label>
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  placeholder="Search by name or phone number..."
                  className="flex-1 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setFilters((prev) => ({ ...prev, search: "" }));
                      setPage(1);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
                  >
                    Clear
                  </button>
                )}
              </form>
              {filters.search && (
                <div className="mt-3 text-sm text-gray-300">
                  Searching for: <span className="text-white font-medium">"{filters.search}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading students...</p>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-lg rounded-3xl p-4 border border-red-500/20 shadow-2xl">
            <div className="text-red-400 text-center">{error}</div>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 backdrop-blur-lg rounded-3xl p-4 border border-green-500/20 shadow-2xl">
            <div className="text-green-400 text-center">{success}</div>
          </div>
        )}

        {/* Students Cards */}
        {!loading && (
          <div className="space-y-4">
            {students.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <p className="text-white text-lg">No students found</p>
                <p className="text-gray-300 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              students.map((student) => {
                const isExpanded = expandedCards.has(student.id);
                
                return (
                  <div key={student.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Card Header - Collapsed State */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                      onClick={() => toggleCardExpansion(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{student.name}</h3>
                            <p className="text-gray-300 text-xs truncate">{student.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                          <div className="transform transition-transform duration-200 flex-shrink-0">
                            <span className="text-white text-lg">{isExpanded ? '−' : '+'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-white/10">
                        {/* Student Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Student Details</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Name:</span>
                              <span className="text-white font-medium truncate">{student.name}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Phone:</span>
                              <span className="text-white truncate">{student.phone}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">SMS Phone:</span>
                              <span className="text-white truncate">{student.smsPhone}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Category:</span>
                              <span className="text-white font-medium truncate">
                                {categories.find((c) => c.id === student.categoryId)?.title || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Additional Information</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Joining Date:</span>
                              <span className="text-white truncate">
                                {new Date(student.joiningDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Booking Amount:</span>
                              <span className="text-white font-medium truncate">
                                {student.bookingAmount ? formatCurrency(student.bookingAmount) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(student.status)}`}>
                                {student.status}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Student ID:</span>
                              <span className="text-white truncate">{student.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setModalMode('view');
                              setModalOpen(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200"
                          >
                            Edit
                          </button>
                          {role === 'admin' && (
                            <button
                              onClick={() => handleDelete(student)}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {total > 0 && totalPages > 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-white">
                Page {page} of {totalPages} ({total} students)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                >
                  ← Previous
                </button>
                
                {/* Show limited page numbers */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  // Add first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 py-2 text-white">
                          ...
                        </span>
                      );
                    }
                  }
                  
                  // Add visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-4 py-2 rounded-2xl transition-all duration-200 ${
                          page === i 
                            ? "bg-blue-600 text-white" 
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Add last page and ellipsis if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 py-2 text-white">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalOpen && selectedStudent && (
        <StudentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          student={selectedStudent}
          mode={modalMode}
          categories={categories}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
