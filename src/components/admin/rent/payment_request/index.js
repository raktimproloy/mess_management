"use client";
import React, { useState, useMemo, useEffect } from "react";

const initialCategories = [
  { id: 1, title: "Breakfast" },
  { id: 2, title: "Lunch" },
  { id: 3, title: "Dinner" },
];
const PAGE_SIZE = 5;

function getUnique(arr, key) {
  return [...new Set(arr.map((item) => item[key]))].filter(Boolean);
}

export default function PaymentRequest() {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    month: "",
    year: "",
    category: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    import("./requests.json").then((mod) => setRequests(mod.default || []));
  }, []);

  // Extract unique months and years from data
  const months = useMemo(() => getUnique(requests, "rentMonth").map(m => m.split(" ")[0]), [requests]);
  const years = useMemo(() => getUnique(requests, "rentMonth").map(m => m.split(" ")[1]), [requests]);

  // Filtering
  const filteredRequests = useMemo(() => {
    let data = requests;
    if (filters.category) {
      data = data.filter((r) => String(r.category) === filters.category);
    }
    if (filters.month) {
      data = data.filter((r) => r.rentMonth.split(" ")[0] === filters.month);
    }
    if (filters.year) {
      data = data.filter((r) => r.rentMonth.split(" ")[1] === filters.year);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(q));
    }
    return data;
  }, [requests, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, page]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const handleAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action === "accept" ? "accepted" : "rejected" } : req
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="text-2xl font-bold text-black mb-6">Payment Requests</div>
      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end mb-4 bg-white p-4 rounded-lg shadow">
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
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Month</label>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">All</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">All</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
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
            placeholder="Name"
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
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Requested Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Pay For</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Payment Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Rent Month</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Request Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-black">No data found.</td>
              </tr>
            ) : (
              paginatedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-black">{req.name}</td>
                  <td className="px-4 py-2 text-sm text-black">{initialCategories.find((c) => c.id === req.category)?.title || "-"}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{req.requestedAmount}</td>
                  <td className="px-4 py-2 text-sm text-black">{req.payFor.charAt(0).toUpperCase() + req.payFor.slice(1)}</td>
                  <td className="px-4 py-2 text-sm text-black">{req.paymentType.charAt(0).toUpperCase() + req.paymentType.slice(1)}</td>
                  <td className="px-4 py-2 text-sm text-black">{req.rentMonth}</td>
                  <td className="px-4 py-2 text-sm text-black">{req.requestDate}</td>
                  <td className="px-4 py-2 text-sm text-black">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${req.status === 'pending' ? 'bg-yellow-100' : req.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'} text-black`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-black">
                    {req.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(req.id, "accept")}
                          className="px-2 py-1 border border-black rounded hover:bg-green-200 text-black transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "reject")}
                          className="px-2 py-1 border border-black rounded hover:bg-red-200 text-black transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="px-2 py-1 border border-black rounded bg-gray-200 text-black opacity-50 cursor-not-allowed"
                        >
                          Accept
                        </button>
                        <button
                          disabled
                          className="px-2 py-1 border border-black rounded bg-gray-200 text-black opacity-50 cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-black">Page {page} of {totalPages}</div>
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
