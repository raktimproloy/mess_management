"use client"
import React, { useState, useMemo, useEffect } from "react";

const initialCategories = [
  { id: 1, title: "Breakfast" },
  { id: 2, title: "Lunch" },
  { id: 3, title: "Dinner" },
];

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
  const [filters, setFilters] = useState({
    status: "living",
    category: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState(null);

  // Load students from API
  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch("/api/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message || "Error loading students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRole(getRole());
    fetchStudents();
  }, []);

  // Filtering logic
  const filteredStudents = useMemo(() => {
    let data = students;
    if (filters.status) {
      data = data.filter((s) => s.status === filters.status);
    }
    if (filters.category) {
      data = data.filter((s) => String(s.category) === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          (s.smsPhone && s.smsPhone.includes(q))
      );
    }
    return data;
  }, [students, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1;
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
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // Add/Edit/Delete handlers (modals/forms can be implemented as needed)
  const handleAddNew = () => {
    alert("Show add student modal");
  };
  const handleEdit = (student) => {
    alert(`Show edit modal for: ${student.name}`);
  };
  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student ${student.name}?`)) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const res = await fetch(`/api/student/${student.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete student");
      setSuccess("Student deleted");
      fetchStudents();
    } catch (err) {
      setError(err.message || "Error deleting student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#18181b] dark:bg-[#18181b]">
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
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-4 items-end mb-4 bg-[#232329] dark:bg-[#232329] p-4 rounded-lg shadow"
      >
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
            {initialCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
            placeholder="Name or phone"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>
      {/* Feedback */}
      {loading && <div className="text-blue-400 mb-2">Loading...</div>}
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
                  No students found.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#18181b]">
                  <td className="px-4 py-2 text-sm text-white">{student.name}</td>
                  <td className="px-4 py-2 text-sm text-white">{student.phone}</td>
                  <td className="px-4 py-2 text-sm text-white">{student.smsPhone}</td>
                  <td className="px-4 py-2 text-sm text-white">
                    {initialCategories.find((c) => c.id === student.category)?.title || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-white">{student.joiningDate}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${student.status === 'living' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-white">
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`View: ${student.name}`)}
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
                        onClick={() => alert(`Rent: ${student.name}`)}
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
          Page {page} of {totalPages}
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
    </div>
  );
}
