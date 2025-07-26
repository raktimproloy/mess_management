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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232329] rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-gray-700">
        <h2 className="text-xl font-semibold mb-6 text-white">
          {mode === 'edit' ? 'Edit Student' : 'Student Details'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input name="name" value={form.name || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input name="phone" value={form.phone || ''} disabled className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SMS Phone</label>
            <input name="smsPhone" value={form.smsPhone || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select name="categoryId" value={form.categoryId || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select name="status" value={form.status || ''} onChange={handleChange} disabled={mode === 'view'} className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white">
              <option value="living">Living</option>
              <option value="leave">Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Joining Date</label>
            <input name="joiningDate" type="date" value={form.joiningDate ? form.joiningDate.split('T')[0] : ''} onChange={handleChange} disabled className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white" />
          </div>
          {showNewJoining && (
            <div>
              <label className="block text-sm font-medium text-yellow-300 mb-2">New Joining Date</label>
              <input name="newJoiningDate" type="date" value={form.newJoiningDate || ''} onChange={handleChange} required className="w-full px-4 py-3 border border-yellow-600 rounded-lg bg-gray-700 text-yellow-200" />
            </div>
          )}
          {mode === 'edit' && (
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
            </div>
          )}
          {mode === 'view' && (
            <div className="flex justify-end pt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600">Close</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZE = 5;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  // Add a state for search input
  const [searchInput, setSearchInput] = useState("");

  // Load students from API
  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: page,
        limit: PAGE_SIZE,
        status: filters.status,
        category: filters.category,
        search: filters.search,
      });
      const res = await fetch(`/api/student?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.students);
      setPage(data.page);
      setTotalPages(data.totalPages);
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

  const [totalPages, setTotalPages] = useState(1);

  // Filtering logic
  const filteredStudents = useMemo(() => {
    return students;
  }, [students]);

  // Pagination logic
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

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

  // Add/Edit/Delete handlers
  const handleAddNew = () => {
    router.push('/admin/students/create');
    // setSelectedStudent(null);
    // setModalMode('edit');
    // setModalOpen(true);
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

  return (
    <div className="p-6 min-h-screen bg-[#18181b] dark:bg-[#18181b]">
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
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Student List</h1>
        {role === 'admin' && (
          <button
            onClick={handleAddNew}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
          >
            Add New
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end mb-4 bg-[#232329] dark:bg-[#232329] p-4 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
          >
            <option value="living">Living</option>
            <option value="leave">Leave</option>
            <option value="">All</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search by name or phone"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#18181b] dark:text-white dark:border-gray-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Feedback */}
      {loading && (
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-400">Loading...</span>
        </div>
      )}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}
      
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-[#232329] dark:bg-[#232329]">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#18181b] dark:bg-[#18181b]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">SMS Phone</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Joining Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-white">
                  {loading ? "Loading students..." : "No students found."}
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#18181b]">
                  <td className="px-4 py-2 text-sm text-white">{student.name}</td>
                  <td className="px-4 py-2 text-sm text-white">{student.phone}</td>
                  <td className="px-4 py-2 text-sm text-white">{student.smsPhone}</td>
                  <td className="px-4 py-2 text-sm text-white">
                    {categories.find((c) => c.id === student.categoryId)?.title || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-white">
                    {new Date(student.joiningDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${student.status === 'living' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-white">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setModalMode('view');
                          setModalOpen(true);
                        }}
                        className="px-2 py-1 border border-white rounded hover:bg-gray-700 text-white transition"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="px-2 py-1 border border-yellow-400 rounded hover:bg-yellow-700 text-yellow-300 transition"
                        title="Edit"
                      >
                        Edit
                      </button>
                      {role === 'admin' && (
                        <button
                          onClick={() => handleDelete(student)}
                          className="px-2 py-1 border border-red-400 rounded hover:bg-red-700 text-red-300 transition"
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() => toast.info(`Opening rent for ${student.name}`)}
                        className="px-2 py-1 border border-blue-400 rounded hover:bg-blue-700 text-blue-300 transition"
                        title="Rent"
                      >
                        Rent
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-white">
          Page {page} of {totalPages} ({filteredStudents.length} students)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
