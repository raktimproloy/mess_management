"use client";
import React, { useState, useMemo, useEffect } from "react";

const initialCategories = [
  { id: 1, title: "Breakfast" },
  { id: 2, title: "Lunch" },
  { id: 3, title: "Dinner" },
];
const PAGE_SIZE = 5;

function getMonthYear() {
  const now = new Date();
  return now.toLocaleString("default", { month: "long", year: "numeric" });
}

function getSummary(rents) {
  const totalStudent = rents.length;
  const totalRent = rents.reduce((sum, r) => sum + (r.totalRent || 0), 0);
  const totalPaid = rents.filter((r) => r.status === "paid").reduce((sum, r) => sum + (r.totalRent || 0), 0);
  const totalDue = rents.filter((r) => r.status !== "paid").reduce((sum, r) => sum + (r.totalRent || 0), 0);
  return { totalStudent, totalRent, totalPaid, totalDue };
}

export default function CurrentRent() {
  const [rents, setRents] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, type: null, rent: null });
  const [payAmount, setPayAmount] = useState("");
  const [confirmModal, setConfirmModal] = useState({ open: false, rent: null });

  useEffect(() => {
    import("./rents.json").then((mod) => setRents(mod.default || []));
  }, []);

  // Filtering
  const filteredRents = useMemo(() => {
    let data = rents;
    if (filters.category) {
      data = data.filter((r) => String(r.category) === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(q));
    }
    return data;
  }, [rents, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRents.length / PAGE_SIZE) || 1;
  const paginatedRents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRents.slice(start, start + PAGE_SIZE);
  }, [filteredRents, page]);

  // Summary
  const summary = useMemo(() => getSummary(filteredRents), [filteredRents]);

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
  const openModal = (type, rent) => {
    if (type === "full") {
      setConfirmModal({ open: true, rent });
    } else {
      setModal({ open: true, type, rent });
      setPayAmount("");
    }
  };
  const closeModal = () => {
    setModal({ open: false, type: null, rent: null });
    setPayAmount("");
  };
  const closeConfirmModal = () => {
    setConfirmModal({ open: false, rent: null });
  };
  const handleConfirmFullPay = () => {
    setConfirmModal({ open: false, rent: null });
    setModal({ open: true, type: "full", rent: confirmModal.rent });
    setPayAmount("");
  };
  const handlePay = () => {
    alert(`Paid ${payAmount} for ${modal.type} to ${modal.rent.name}`);
    closeModal();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top summary */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-2xl font-bold text-black">{getMonthYear()}</div>
        <div className="flex gap-6 flex-wrap">
          <div className="text-black">Total Student: <span className="font-bold">{summary.totalStudent}</span></div>
          <div className="text-black">Total Rent: <span className="font-bold">₹{summary.totalRent}</span></div>
          <div className="text-black">Total Paid: <span className="font-bold">₹{summary.totalPaid}</span></div>
          <div className="text-black">Total Due: <span className="font-bold">₹{summary.totalDue}</span></div>
        </div>
      </div>
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
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Advance Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Monthly Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">External Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Total Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-black">No data found.</td>
              </tr>
            ) : (
              paginatedRents.map((rent) => (
                <tr key={rent.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-black">{rent.name}</td>
                  <td className="px-4 py-2 text-sm text-black">{initialCategories.find((c) => c.id === rent.category)?.title || "-"}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.advanceRent}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.monthlyRent}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.externalRent}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.totalRent}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${rent.status === 'paid' ? 'bg-green-100 text-black' : 'bg-red-100 text-black'}`}>
                      {rent.status.charAt(0).toUpperCase() + rent.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-black">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal("full", rent)}
                        className="px-2 py-1 border border-black rounded hover:bg-green-200 text-black transition"
                        title="Full Pay"
                      >
                        Full Pay
                      </button>
                      <button
                        onClick={() => openModal("pay", rent)}
                        className="px-2 py-1 border border-black rounded hover:bg-blue-200 text-black transition"
                        title="Pay"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => openModal("adv", rent)}
                        className="px-2 py-1 border border-black rounded hover:bg-yellow-200 text-black transition"
                        title="Pay Adv"
                      >
                        Pay Adv
                      </button>
                      <button
                        onClick={() => alert(`Profile: ${rent.name}`)}
                        className="px-2 py-1 border border-black rounded hover:bg-gray-200 text-black transition"
                        title="Profile"
                      >
                        Profile
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
      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black text-center">
              {modal.type === "full" && "Full Pay"}
              {modal.type === "pay" && "Pay"}
              {modal.type === "adv" && "Pay Advance"}
            </h2>
            <div className="mb-4 text-black">
              {modal.type === "full" && (
                <>
                  <div>Total Rent: <span className="font-bold">₹{modal.rent.totalRent}</span></div>
                  <input
                    type="number"
                    className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter amount"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </>
              )}
              {modal.type === "pay" && (
                <>
                  <div>Total Rent: <span className="font-bold">₹{modal.rent.totalRent}</span></div>
                  <input
                    type="number"
                    className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter amount"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </>
              )}
              {modal.type === "adv" && (
                <>
                  <div>Advance Rent: <span className="font-bold">₹{modal.rent.advanceRent}</span></div>
                  <input
                    type="number"
                    className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter amount"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </>
              )}
            </div>
            <button
              onClick={handlePay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
            >
              Pay
            </button>
          </div>
        </div>
      )}
      {/* Full Pay Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={closeConfirmModal}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Confirm Full Pay</h2>
            <div className="mb-4 text-black text-center">
              Are you sure you want to fully pay for <span className="font-bold">{confirmModal.rent?.name}</span>?
              <div className="mt-2">Total Rent: <span className="font-bold">₹{confirmModal.rent?.totalRent}</span></div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleConfirmFullPay}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={closeConfirmModal}
                className="px-6 py-2 rounded-md bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
