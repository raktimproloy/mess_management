"use client";
import React, { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

const PAGE_SIZE = 10;

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
  const [rentPaid, setRentPaid] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [externalPaid, setExternalPaid] = useState("");
  const [previousDuePaid, setPreviousDuePaid] = useState("");
  const [paymentType, setPaymentType] = useState("on hand");
  const [confirmModal, setConfirmModal] = useState({ open: false, rent: null });
  const [expandedCards, setExpandedCards] = useState(new Set());

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
      setRentPaid("");
      setAdvancePaid("");
      setExternalPaid("");
      setPreviousDuePaid("");
      setPaymentType("on hand");
    }
  };
  const closeModal = () => {
    setModal({ open: false, type: null, rent: null });
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

  const toggleCardExpansion = (rentId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(rentId)) {
      newExpanded.delete(rentId);
    } else {
      newExpanded.add(rentId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unpaid': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">💰 Current Rent</h1>
              <p className="text-gray-300 text-sm mt-1">{getMonthYear()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">👥</div>
              <div className="text-right">
                <p className="text-gray-300 text-xs">Total Students</p>
                <p className="text-xl font-bold text-white">{summary.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">💰</div>
              <div className="text-right">
                <p className="text-gray-300 text-xs">Total Rent</p>
                <p className="text-xl font-bold text-white">৳{summary.totalRent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">✅</div>
              <div className="text-right">
                <p className="text-gray-300 text-xs">Total Paid</p>
                <p className="text-xl font-bold text-green-400">৳{summary.totalPaid}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">⚠️</div>
              <div className="text-right">
                <p className="text-gray-300 text-xs">Total Due</p>
                <p className="text-xl font-bold text-red-400">৳{summary.totalDue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                  placeholder="Search by name or phone..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              🔍 Search
            </button>
          </form>
        </div>

        {/* Rent Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading rents...</p>
            </div>
          ) : rents.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-white text-lg">No rents found</p>
              <p className="text-gray-300 text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            rents.map((rent) => {
              const isExpanded = expandedCards.has(rent.id);
              const totalDue = (rent.rentAmount || 0) - (rent.rentPaid || 0) + 
                              (rent.advanceAmount || 0) - (rent.advancePaid || 0) + 
                              (rent.externalAmount || 0) - (rent.externalPaid || 0) + 
                              (rent.previousDue || 0) - (rent.previousDuePaid || 0);

              return (
                <div key={rent.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Card Header - Collapsed State */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                    onClick={() => toggleCardExpansion(rent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {rent.student?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div> */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-base truncate">{rent.student?.name}</h3>
                          <p className="text-gray-300 text-xs truncate">৳{totalDue} due</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rent.status)}`}>
                          {getStatusText(rent.status)}
                        </span>
                        <div className="transform transition-transform duration-200">
                          <span className="text-white text-lg">{isExpanded ? '−' : '+'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-white/10">
                      {/* Student & Category Info */}
                      <div className="bg-white/5 rounded-2xl p-4">
                        <h4 className="text-white font-medium mb-3">👤 Student & Category Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-300">Student Name: </span>
                            <span className="text-white font-medium">{rent.student?.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Student ID: </span>
                            <span className="text-white">{rent.studentId}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Category: </span>
                            <span className="text-white font-medium">{rent.category?.title}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Category ID: </span>
                            <span className="text-white">{rent.categoryId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Rent Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-blue-300 font-medium mb-3">🏠 Monthly Rent</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Total Amount:</span>
                              <span className="text-white font-medium">৳{rent.rentAmount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Paid Amount:</span>
                              <span className="text-green-400 font-medium">৳{rent.rentPaid || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Remaining:</span>
                              <span className="text-red-400 font-medium">৳{(rent.rentAmount || 0) - (rent.rentPaid || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Advance Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-yellow-300 font-medium mb-3">💰 Advance</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Total Amount:</span>
                              <span className="text-white font-medium">৳{rent.advanceAmount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Paid Amount:</span>
                              <span className="text-green-400 font-medium">৳{rent.advancePaid || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Remaining:</span>
                              <span className="text-red-400 font-medium">৳{(rent.advanceAmount || 0) - (rent.advancePaid || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* External Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-purple-300 font-medium mb-3">🌐 External</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Total Amount:</span>
                              <span className="text-white font-medium">৳{rent.externalAmount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Paid Amount:</span>
                              <span className="text-green-400 font-medium">৳{rent.externalPaid || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Remaining:</span>
                              <span className="text-red-400 font-medium">৳{(rent.externalAmount || 0) - (rent.externalPaid || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Previous Due Details */}
                        {rent.previousDue > 0 && (
                          <div className="bg-white/5 rounded-2xl p-4">
                            <h4 className="text-orange-300 font-medium mb-3">📅 Previous Due</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-300">Total Amount:</span>
                                <span className="text-white font-medium">৳{rent.previousDue || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Paid Amount:</span>
                                <span className="text-green-400 font-medium">৳{rent.previousDuePaid || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Remaining:</span>
                                <span className="text-red-400 font-medium">৳{(rent.previousDue || 0) - (rent.previousDuePaid || 0)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment History */}
                      <div className="bg-white/5 rounded-2xl p-4">
                        <h4 className="text-white font-medium mb-3">📊 Payment History</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-300">Paid Date: </span>
                            <span className="text-white">{rent.paidDate ? new Date(rent.paidDate).toLocaleDateString() : 'Not paid'}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Payment Type: </span>
                            <span className="text-white">{rent.paidType || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => openModal("full", rent)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                        >
                          💰 Full Pay
                        </button>
                        <button
                          onClick={() => openModal("pay", rent)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                        >
                          💳 Partial Pay
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-white">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                >
                  ← Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-2xl transition-all duration-200 ${
                        page === pageNum 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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

      {/* Payment Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {modal.type === "full" && "💰 Full Payment"}
                  {modal.type === "pay" && "💳 Partial Payment"}
                  {modal.type === "adv" && "💰 Advance Payment"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white text-2xl font-bold hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-white font-medium mb-2">👤 Student Information</h3>
                  <p className="text-white text-lg font-semibold">{modal.rent?.student?.name}</p>
                  <p className="text-gray-300 text-sm">ID: {modal.rent?.studentId}</p>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Payment Method</label>
                  <select
                    className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value)}
                  >
                    <option value="on hand">💵 Cash Payment</option>
                    <option value="online">💳 Online Payment</option>
                  </select>
                </div>

                {/* Payment Sections */}
                <div className="space-y-4">
                  {/* Rent Payment */}
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-blue-300 font-medium mb-3">🏠 Monthly Rent Payment</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Total Rent:</span>
                        <span className="text-white">৳{modal.rent?.rentAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Already Paid:</span>
                        <span className="text-green-400">৳{modal.rent?.rentPaid || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Remaining Due:</span>
                        <span className="text-red-400">৳{(modal.rent?.rentAmount || 0) - (modal.rent?.rentPaid || 0)}</span>
                      </div>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                        placeholder="Enter rent payment amount"
                        value={rentPaid}
                        onChange={e => setRentPaid(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Advance Payment */}
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-yellow-300 font-medium mb-3">💰 Advance Payment</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Total Advance:</span>
                        <span className="text-white">৳{modal.rent?.advanceAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Already Paid:</span>
                        <span className="text-green-400">৳{modal.rent?.advancePaid || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Remaining Due:</span>
                        <span className="text-red-400">৳{(modal.rent?.advanceAmount || 0) - (modal.rent?.advancePaid || 0)}</span>
                      </div>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                        placeholder="Enter advance payment amount"
                        value={advancePaid}
                        onChange={e => setAdvancePaid(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* External Payment */}
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-purple-300 font-medium mb-3">🌐 External Payment</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Total External:</span>
                        <span className="text-white">৳{modal.rent?.externalAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Already Paid:</span>
                        <span className="text-green-400">৳{modal.rent?.externalPaid || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Remaining Due:</span>
                        <span className="text-red-400">৳{(modal.rent?.externalAmount || 0) - (modal.rent?.externalPaid || 0)}</span>
                      </div>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                        placeholder="Enter external payment amount"
                        value={externalPaid}
                        onChange={e => setExternalPaid(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Previous Due Payment */}
                  {modal.rent?.previousDue > 0 && (
                    <div className="bg-white/5 rounded-2xl p-4">
                      <h4 className="text-orange-300 font-medium mb-3">📅 Previous Due Payment</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Total Previous Due:</span>
                          <span className="text-white">৳{modal.rent?.previousDue || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Already Paid:</span>
                          <span className="text-green-400">৳{modal.rent?.previousDuePaid || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Remaining Due:</span>
                          <span className="text-red-400">৳{(modal.rent?.previousDue || 0) - (modal.rent?.previousDuePaid || 0)}</span>
                        </div>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                          placeholder="Enter previous due payment amount"
                          value={previousDuePaid}
                          onChange={e => setPreviousDuePaid(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-500/30">
                    <h4 className="text-white font-medium mb-3">📊 Payment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-300">Rent Payment:</span>
                        <span className="text-blue-300 font-medium block">৳{parseFloat(rentPaid) || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Advance Payment:</span>
                        <span className="text-yellow-300 font-medium block">৳{parseFloat(advancePaid) || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">External Payment:</span>
                        <span className="text-purple-300 font-medium block">৳{parseFloat(externalPaid) || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-300">Total Payment:</span>
                        <span className="text-green-400 font-bold text-lg block">৳{(parseFloat(rentPaid) || 0) + (parseFloat(advancePaid) || 0) + (parseFloat(externalPaid) || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handlePay}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  💳 Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Pay Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">💰</div>
                <h2 className="text-xl font-semibold text-white mb-2">Confirm Full Payment</h2>
                <p className="text-gray-300 text-sm">Are you sure you want to fully pay for this student?</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <h3 className="text-white font-medium mb-3">👤 Student Details</h3>
                <p className="text-white text-lg font-semibold">{confirmModal.rent?.student?.name}</p>
                <p className="text-gray-300 text-sm">ID: {confirmModal.rent?.studentId}</p>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-gray-300 text-sm">Total Amount Due:</p>
                  <p className="text-green-400 font-bold text-xl">
                    ৳{(confirmModal.rent?.rentAmount || 0) + (confirmModal.rent?.externalAmount || 0) + (confirmModal.rent?.previousDue || 0)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Payment Method</label>
                <select
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                >
                  <option value="on hand">💵 Cash Payment</option>
                  <option value="online">💳 Online Payment</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmFullPay}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  ✅ Confirm
                </button>
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 bg-white/10 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-200"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
