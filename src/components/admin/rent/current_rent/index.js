"use client";
import React, { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

const PAGE_SIZE = 5;

function getMonthYear() {
  const now = new Date();
  return now.toLocaleString("default", { month: "long", year: "numeric" });
}

export default function CurrentRent() {
  const [rents, setRents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalStudents: 0, totalRent: 0, totalPaid: 0, totalDue: 0 });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, type: null, rent: null });
  const [payAmount, setPayAmount] = useState("");
  const [rentPaid, setRentPaid] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [externalPaid, setExternalPaid] = useState("");
  const [previousDuePaid, setPreviousDuePaid] = useState("");
  const [paymentType, setPaymentType] = useState("on hand");
  const [confirmModal, setConfirmModal] = useState({ open: false, rent: null });

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        setCategories([]);
        toast.error("Error loading categories");
      }
    }
    fetchCategories();
  }, []);

  // Fetch rents from API
  useEffect(() => {
    async function fetchRents() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page,
          pageSize: PAGE_SIZE,
          search: filters.search,
          category: filters.category,
        });
        const res = await fetch(`/api/rent/current?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch rents");
        const data = await res.json();
        setRents(data.rents || []);
        setSummary(data.summary || { totalStudents: 0, totalRent: 0, totalPaid: 0, totalDue: 0 });
        setTotalPages(Math.ceil((data.total || 1) / PAGE_SIZE));
      } catch (error) {
        setRents([]);
        setSummary({ totalStudents: 0, totalRent: 0, totalPaid: 0, totalDue: 0 });
        toast.error("Error loading rents");
      } finally {
        setLoading(false);
      }
    }
    fetchRents();
  }, [page, filters.search, filters.category]);

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
      setPaymentType("on hand");
    } else {
      setModal({ open: true, type, rent });
      setPayAmount("");
      setRentPaid("");
      setAdvancePaid("");
      setExternalPaid("");
      setPreviousDuePaid("");
      setPaymentType("on hand");
    }
  };
  const closeModal = () => {
    setModal({ open: false, type: null, rent: null });
    setPayAmount("");
    setRentPaid("");
    setAdvancePaid("");
    setExternalPaid("");
  };
  const closeConfirmModal = () => {
    setConfirmModal({ open: false, rent: null });
  };
  const handleConfirmFullPay = async () => {
    try {
      const response = await fetch("/api/rent/full-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentId: confirmModal.rent.id, paidType: paymentType })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Full payment successful! ${confirmModal.rent.student?.name}`);
        setConfirmModal({ open: false, rent: null });
        // Refresh the rent data
        const params = new URLSearchParams({
          page: page,
          pageSize: PAGE_SIZE,
          search: filters.search,
          category: filters.category,
        });
        const res = await fetch(`/api/rent/current?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRents(data.rents || []);
          setSummary(data.summary || { totalStudents: 0, totalRent: 0, totalPaid: 0, totalDue: 0 });
        }
      } else {
        toast.error(result.message || "Full payment failed");
      }
    } catch (error) {
      console.error("Full payment error:", error);
      toast.error("Full payment failed. Please try again.");
    }
  };
  const handlePay = async () => {
    // Partial payment - validate that at least one amount is entered
    if (!rentPaid && !advancePaid && !externalPaid && !previousDuePaid) {
      toast.error("Please enter at least one payment amount");
      return;
    }

    try {
      // Partial payment
      const paymentData = {
        rentId: modal.rent.id,
        paymentType: modal.type === "pay" ? "monthly_rent" : "advance_payment",
        rentPaid: parseFloat(rentPaid) || 0,
        advancePaid: parseFloat(advancePaid) || 0,
        externalPaid: parseFloat(externalPaid) || 0,
        previousDuePaid: parseFloat(previousDuePaid) || 0,
        paidType: paymentType
      };

      const response = await fetch("/api/rent/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success) {
        const totalPaid = (parseFloat(rentPaid) || 0) + (parseFloat(advancePaid) || 0) + (parseFloat(externalPaid) || 0);
        toast.success(`Partial payment successful! ${modal.rent.student?.name} - ৳${totalPaid}`);
        closeModal();
        // Refresh the rent data
        const params = new URLSearchParams({
          page: page,
          pageSize: PAGE_SIZE,
          search: filters.search,
          category: filters.category,
        });
        const res = await fetch(`/api/rent/current?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRents(data.rents || []);
          setSummary(data.summary || { totalStudents: 0, totalRent: 0, totalPaid: 0, totalDue: 0 });
        }
      } else {
        toast.error(result.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
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
      {/* Top summary */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-2xl font-bold text-white">{getMonthYear()}</div>
        <div className="flex gap-6 flex-wrap">
          <div className="text-white">Total Student: <span className="font-bold">{summary.totalStudents}</span></div>
          <div className="text-white">Total Rent: <span className="font-bold">৳{summary.totalRent}</span></div>
          <div className="text-white">Total Paid: <span className="font-bold">৳{summary.totalPaid}</span></div>
          <div className="text-white">Total Due: <span className="font-bold">৳{summary.totalDue}</span></div>
        </div>
      </div>
      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end mb-4 bg-[#232329] dark:bg-[#232329] p-4 rounded-lg shadow">
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
              <option key={cat.id} value={cat.id}>{cat.title}</option>
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
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-[#232329] dark:bg-[#232329]">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#18181b] dark:bg-[#18181b]">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Student</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Month</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Rent Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Advance Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">External Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Previous Due</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Previous Due Paid</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Rent Paid</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Advance Paid</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">External Paid</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Paid Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Paid Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Created At</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Updated At</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={18} className="px-4 py-6 text-center text-white">Loading...</td></tr>
            ) : rents.length === 0 ? (
              <tr><td colSpan={18} className="px-4 py-6 text-center text-white">No data found.</td></tr>
            ) : (
              rents.map((rent) => {
                return (
                  <tr key={rent.id} className="hover:bg-[#18181b]">
                    <td className="px-4 py-2 text-sm text-white">{rent.id}</td>
                    <td className="px-4 py-2 text-sm text-white">{rent.student?.name} <br/><span className="text-xs text-gray-400">ID: {rent.studentId}</span></td>
                    <td className="px-4 py-2 text-sm text-white">{rent.category?.title} <br/><span className="text-xs text-gray-400">ID: {rent.categoryId}</span></td>
                    <td className="px-4 py-2 text-sm text-white">{rent.monthYear ? new Date(rent.monthYear).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.rentAmount}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.advanceAmount}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.externalAmount}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.previousDue}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.previousDuePaid}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${rent.status === 'paid' ? 'bg-green-700 text-white' : rent.status === 'partial' ? 'bg-yellow-700 text-white' : 'bg-red-700 text-white'}`}>
                        {rent.status.charAt(0).toUpperCase() + rent.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.rentPaid}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.advancePaid}</td>
                    <td className="px-4 py-2 text-sm text-white">৳{rent.externalPaid}</td>
                    <td className="px-4 py-2 text-sm text-white">{rent.paidDate ? new Date(rent.paidDate).toLocaleString() : "-"}</td>
                    <td className="px-4 py-2 text-sm text-white">{rent.paidType || "-"}</td>
                    <td className="px-4 py-2 text-sm text-white">{rent.createdAt ? new Date(rent.createdAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-2 text-sm text-white">{rent.updatedAt ? new Date(rent.updatedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-2 text-sm text-white">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("full", rent)}
                          className="px-2 py-1 border border-white rounded hover:bg-green-700 text-white transition"
                          title="Full Pay"
                        >
                          Full Pay
                        </button>
                        <button
                          onClick={() => openModal("pay", rent)}
                          className="px-2 py-1 border border-blue-400 rounded hover:bg-blue-700 text-blue-300 transition"
                          title="Pay"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => toast.info(`Profile: ${rent.student?.name}`)}
                          className="px-2 py-1 border border-gray-400 rounded hover:bg-gray-700 text-gray-300 transition"
                          title="Profile"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-white">Page {page} of {totalPages}</div>
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
      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232329] rounded-lg shadow-lg w-full max-w-2xl p-6 relative animate-fadeIn border border-gray-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white text-center">
              {modal.type === "full" && "Full Payment"}
              {modal.type === "pay" && "Monthly Rent Payment"}
              {modal.type === "adv" && "Advance Payment"}
            </h2>
            
            <div className="mb-4 text-white space-y-4">
              {/* Payment Type Selector */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Payment Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232329] text-white border-gray-600"
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                >
                  <option value="on hand">On Hand</option>
                  <option value="online">Online</option>
                </select>
              </div>
              {/* Rent Due Section */}
              <div className="bg-[#18181b] p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Monthly Rent Due</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-gray-300">Total Rent: </span>
                    <span className="font-bold text-white">৳{modal.rent.rentAmount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Already Paid: </span>
                    <span className="font-bold text-green-400">৳{modal.rent.rentPaid || 0}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-gray-300">Remaining Due: </span>
                  <span className="font-bold text-red-400">৳{(modal.rent.rentAmount || 0) - (modal.rent.rentPaid || 0)}</span>
                </div>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232329] text-white border-gray-600"
                  placeholder="Enter rent payment amount"
                  value={rentPaid}
                  onChange={e => setRentPaid(e.target.value)}
                />
              </div>

              {/* Advance Due Section */}
              <div className="bg-[#18181b] p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-yellow-300">Advance Due</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-gray-300">Total Advance: </span>
                    <span className="font-bold text-white">৳{modal.rent.advanceAmount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Already Paid: </span>
                    <span className="font-bold text-green-400">৳{modal.rent.advancePaid || 0}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-gray-300">Remaining Due: </span>
                  <span className="font-bold text-red-400">৳{(modal.rent.advanceAmount || 0) - (modal.rent.advancePaid || 0)}</span>
                </div>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232329] text-white border-gray-600"
                  placeholder="Enter advance payment amount"
                  value={advancePaid}
                  onChange={e => setAdvancePaid(Number(e.target.value))}
                />
                {advancePaid > 0 && (
                  <div className="text-green-500 text-xs mt-1">Advance will be carried forward to next month's rent.</div>
                )}
              </div>

              {/* External Due Section */}
              <div className="bg-[#18181b] p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-purple-300">External Due</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-gray-300">Total External: </span>
                    <span className="font-bold text-white">৳{modal.rent.externalAmount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Already Paid: </span>
                    <span className="font-bold text-green-400">৳{modal.rent.externalPaid || 0}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-gray-300">Remaining Due: </span>
                  <span className="font-bold text-red-400">৳{(modal.rent.externalAmount || 0) - (modal.rent.externalPaid || 0)}</span>
                </div>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232329] text-white border-gray-600"
                  placeholder="Enter external payment amount"
                  value={externalPaid}
                  onChange={e => setExternalPaid(e.target.value)}
                />
              </div>

              {/* Previous Due Section */}
              {modal.rent.previousDue > 0 && (
                <div className="bg-[#18181b] p-4 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-semibold mb-2 text-orange-300">Previous Due</h3>
                  <div className="mb-2">
                    <span className="text-gray-300">Previous Due Amount: </span>
                    <span className="font-bold text-red-400">৳{modal.rent.previousDue || 0}</span>
                  </div>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#232329] text-white border-gray-600"
                    placeholder="Enter previous due payment amount"
                    value={previousDuePaid}
                    onChange={e => setPreviousDuePaid(e.target.value)}
                  />
                  <p className="text-sm text-gray-400 mt-1">This amount will be paid towards previous due.</p>
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-[#18181b] p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-white">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Rent Payment: </span>
                    <span className="font-bold text-blue-300">৳{parseFloat(rentPaid) || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Advance Payment: </span>
                    <span className="font-bold text-yellow-300">৳{parseFloat(advancePaid) || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">External Payment: </span>
                    <span className="font-bold text-purple-300">৳{parseFloat(externalPaid) || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Total Payment: </span>
                    <span className="font-bold text-green-400">৳{(parseFloat(rentPaid) || 0) + (parseFloat(advancePaid) || 0) + (parseFloat(externalPaid) || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
            >
              Process Payment
            </button>
          </div>
        </div>
      )}
      {/* Full Pay Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232329] rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn border border-gray-700">
            <button
              onClick={closeConfirmModal}
              className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white text-center">Confirm Full Pay</h2>
            <div className="mb-4 text-white text-center">
              Are you sure you want to fully pay for <span className="font-bold">{confirmModal.rent?.student?.name}</span>?
              <div className="mt-2">Total Rent: <span className="font-bold">৳{(confirmModal.rent?.rentAmount || 0) + (confirmModal.rent?.externalAmount || 0) + (confirmModal.rent?.previousDue || 0)}</span></div>
              {/* Payment Type Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Payment Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232329] text-white border-gray-600"
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                >
                  <option value="on hand">On Hand</option>
                  <option value="online">Online</option>
                </select>
              </div>
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
                className="px-6 py-2 rounded-md bg-gray-700 text-white font-semibold hover:bg-gray-600 transition"
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
