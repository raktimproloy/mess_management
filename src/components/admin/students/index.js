"use client"
import React, { useState, useMemo, useEffect } from "react";

// Mock categories (sync with add.js)
const initialCategories = [
  { id: 1, title: "Breakfast" },
  { id: 2, title: "Lunch" },
  { id: 3, title: "Dinner" },
];

const PAGE_SIZE = 5;

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    status: "living",
    category: "",
    search: "",
  });
  const [page, setPage] = useState(1);

  // Load students from students.json
  useEffect(() => {
    import("./students.json").then((mod) => {
      setStudents(mod.default || []);
    });
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
          s.smsPhone.includes(q)
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
    if (name !== "search") setPage(1); // Reset page on filter change
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // For Add New button (navigate or open modal)
  const handleAddNew = () => {
    // Implement navigation or modal as needed
    alert("Navigate to Add Student page");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-black">Student List</h1>
        <button
          onClick={handleAddNew}
          className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          Add New
        </button>
      </div>
      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-4 items-end mb-4 bg-white p-4 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium text-black mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="living">Living</option>
            <option value="leave">Leave</option>
            <option value="">All</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
          <label className="block text-sm font-medium text-black mb-1">Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">SMS Phone</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Joining Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-black">
                  No students found.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-black">{student.name}</td>
                  <td className="px-4 py-2 text-sm text-black">{student.phone}</td>
                  <td className="px-4 py-2 text-sm text-black">{student.smsPhone}</td>
                  <td className="px-4 py-2 text-sm text-black">
                    {initialCategories.find((c) => c.id === student.category)?.title || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-black">{student.joiningDate}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${student.status === 'living' ? 'bg-green-100 text-black' : 'bg-red-100 text-black'}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-black">
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`View: ${student.name}`)}
                        className="px-2 py-1 border border-black rounded hover:bg-gray-200 text-black transition"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={() => alert(`Edit: ${student.name}`)}
                        className="px-2 py-1 border border-black rounded hover:bg-yellow-200 text-black transition"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => alert(`Delete: ${student.name}`)}
                        className="px-2 py-1 border border-black rounded hover:bg-red-200 text-black transition"
                        title="Delete"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => alert(`Rent: ${student.name}`)}
                        className="px-2 py-1 border border-black rounded hover:bg-blue-200 text-black transition"
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
        <div className="text-sm text-black">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
