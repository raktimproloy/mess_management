"use client";
import React, { useState, useMemo, useEffect } from "react";

const PAGE_SIZE = 5;

// Mock data for a single student
const studentHistory = [
  { id: 1, monthYear: "June 2024", paidAmount: 2000, beforePaidDue: 2000, due: 0, advance: 0, payFor: "regular", paymentType: "online", paidDate: "2024-06-05", status: "approve" },
  { id: 2, monthYear: "May 2024", paidAmount: 1500, beforePaidDue: 2000, due: 500, advance: 0, payFor: "regular", paymentType: "on hand", paidDate: "2024-05-10", status: "pending" },
  { id: 3, monthYear: "April 2024", paidAmount: 2200, beforePaidDue: 2200, due: 0, advance: 200, payFor: "advance", paymentType: "online", paidDate: "2024-04-15", status: "approve" },
  { id: 4, monthYear: "March 2024", paidAmount: 1000, beforePaidDue: 2000, due: 1000, advance: 0, payFor: "regular", paymentType: "on hand", paidDate: "2024-03-20", status: "pending" },
  { id: 5, monthYear: "February 2024", paidAmount: 550, beforePaidDue: 550, due: 0, advance: 0, payFor: "regular", paymentType: "online", paidDate: "2024-02-25", status: "approve" },
  { id: 6, monthYear: "January 2024", paidAmount: 0, beforePaidDue: 2000, due: 2000, advance: 0, payFor: "regular", paymentType: "on hand", paidDate: "2024-01-30", status: "pending" },
];

function getUnique(arr, key) {
  return [...new Set(arr.map((item) => item[key]))].filter(Boolean);
}

export default function StudentRentHistory() {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    paymentType: "",
    payFor: "",
  });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, record: null });

  useEffect(() => {
    setHistory(studentHistory);
  }, []);

  // Extract unique months and years from data
  const months = useMemo(() => getUnique(history, "monthYear").map(m => m.split(" ")[0]), [history]);
  const years = useMemo(() => getUnique(history, "monthYear").map(m => m.split(" ")[1]), [history]);
  const paymentTypes = ["online", "on hand"];
  const payFors = getUnique(history, "payFor");

  // Filtering
  const filteredHistory = useMemo(() => {
    let data = history;
    if (filters.paymentType) {
      data = data.filter((r) => r.paymentType === filters.paymentType);
    }
    if (filters.month) {
      data = data.filter((r) => r.monthYear.split(" ")[0] === filters.month);
    }
    if (filters.year) {
      data = data.filter((r) => r.monthYear.split(" ")[1] === filters.year);
    }
    if (filters.payFor) {
      data = data.filter((r) => r.payFor === filters.payFor);
    }
    return data;
  }, [history, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE) || 1;
  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredHistory.slice(start, start + PAGE_SIZE);
  }, [filteredHistory, page]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const openModal = (record) => setModal({ open: true, record });
  const closeModal = () => setModal({ open: false, record: null });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="text-2xl font-bold text-black mb-6">My Rent History</div>
      {/* Filters */}
      <form className="flex flex-wrap gap-4 items-end mb-4 bg-white p-4 rounded-lg shadow">
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
          <label className="block text-sm font-medium text-black mb-1">Payment Type</label>
          <select
            name="paymentType"
            value={filters.paymentType}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">All</option>
            {paymentTypes.map((pt) => (
              <option key={pt} value={pt}>{pt.charAt(0).toUpperCase() + pt.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Pay For</label>
          <select
            name="payFor"
            value={filters.payFor}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">All</option>
            {payFors.map((pf) => (
              <option key={pf} value={pf}>{pf.charAt(0).toUpperCase() + pf.slice(1)}</option>
            ))}
          </select>
        </div>
      </form>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Month & Year</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Paid Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Before Paid Due</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">After Paid Due</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Advance</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Pay For</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Payment Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Paid Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-black">No data found.</td>
              </tr>
            ) : (
              paginatedHistory.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-black">{record.monthYear}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{record.paidAmount}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{record.beforePaidDue}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{record.due}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{record.advance}</td>
                  <td className="px-4 py-2 text-sm text-black">{record.payFor.charAt(0).toUpperCase() + record.payFor.slice(1)}</td>
                  <td className="px-4 py-2 text-sm text-black">{record.paymentType.charAt(0).toUpperCase() + record.paymentType.slice(1)}</td>
                  <td className="px-4 py-2 text-sm text-black">{record.paidDate}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${record.status === "approve" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                    `}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-black">
                    <button
                      onClick={() => openModal(record)}
                      className="px-2 py-1 border border-black rounded hover:bg-blue-200 text-black transition"
                      title="View"
                    >
                      View
                    </button>
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
      {/* View Modal */}
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
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Payment Details</h2>
            <div className="mb-4 text-black space-y-2">
              <div><span className="font-semibold">Month & Year:</span> {modal.record?.monthYear}</div>
              <div><span className="font-semibold">Paid Amount:</span> ₹{modal.record?.paidAmount}</div>
              <div><span className="font-semibold">Before Paid Due:</span> ₹{modal.record?.beforePaidDue}</div>
              <div><span className="font-semibold">After Paid Due:</span> ₹{modal.record?.due}</div>
              <div><span className="font-semibold">Advance:</span> ₹{modal.record?.advance}</div>
              <div><span className="font-semibold">Pay For:</span> {modal.record?.payFor?.charAt(0).toUpperCase() + modal.record?.payFor?.slice(1)}</div>
              <div><span className="font-semibold">Payment Type:</span> {modal.record?.paymentType?.charAt(0).toUpperCase() + modal.record?.paymentType?.slice(1)}</div>
              <div><span className="font-semibold">Paid Date:</span> {modal.record?.paidDate}</div>
              <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold 
                ${modal.record?.status === "approve" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
              `}>
                {modal.record?.status?.charAt(0).toUpperCase() + modal.record?.status?.slice(1)}
              </span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
