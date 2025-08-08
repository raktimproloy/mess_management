"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const PAGE_SIZE = 10;

export default function PaymentRequest() {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentMethod: "",
    categoryId: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalAmount: 0
  });
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    fetchCategories();
    fetchPaymentRequests();
  }, [page, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        ...filters
      });

      const response = await fetch(`/api/payment-request?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment requests');
      }

      const data = await response.json();
      setRequests(data.requests);
      setTotalPages(data.totalPages);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast.error('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/payment-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} payment request`);
      }

      toast.success(`Payment request ${action}ed successfully!`);
      fetchPaymentRequests(); // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing payment request:`, error);
      toast.error(`Failed to ${action} payment request`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleCardExpansion = (requestId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'on hand': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'online': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString()}`;
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
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Payment Requests</h1>
              <p className="text-gray-300 text-sm mt-1">Manage student payment requests and approve or reject them</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Total Requests</p>
              <p className="text-base font-bold text-white">{summary.totalRequests}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Pending</p>
              <p className="text-base font-bold text-yellow-400">{summary.pendingRequests}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Approved</p>
              <p className="text-base font-bold text-green-400">{summary.approvedRequests}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Total Amount</p>
              <p className="text-base font-bold text-blue-400">{formatCurrency(summary.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                  placeholder="Student name or phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Methods</option>
                  <option value="on hand">On Hand</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setFilters({ search: "", status: "", paymentMethod: "", categoryId: "" });
                setPage(1);
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading payment requests...</p>
          </div>
        )}

        {/* Requests Cards */}
        {!loading && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <p className="text-white text-lg">No payment requests found</p>
                <p className="text-gray-300 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              requests.map((request) => {
                const isExpanded = expandedCards.has(request.id);
                
                return (
                  <div key={request.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Card Header - Collapsed State */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                      onClick={() => toggleCardExpansion(request.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{request.student?.name || 'N/A'}</h3>
                            <p className="text-gray-300 text-xs truncate">{formatCurrency(request.totalAmount)} requested</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(request.status)}`}>
                            {request.status}
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
                        {/* Request Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Request Details</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Student Name:</span>
                              <span className="text-white font-medium truncate">{request.student?.name || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Student Phone:</span>
                              <span className="text-white truncate">{request.student?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Category:</span>
                              <span className="text-white font-medium truncate">{request.category?.title || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Request Date:</span>
                              <span className="text-white truncate">{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Payment Information</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Amount:</span>
                              <span className="text-white font-bold">{formatCurrency(request.totalAmount)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Payment Method:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-24 ${getPaymentMethodColor(request.paymentMethod)}`}>
                                {request.paymentMethod}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Request ID:</span>
                              <span className="text-white truncate">{request.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {request.status === "pending" ? (
                          <div className="flex gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => handleAction(request.id, "approved")}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(request.id, "rejected")}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-white/10">
                            <span className="text-gray-400 text-xs">
                              {request.status === 'approved' ? 'Already Approved' : 'Already Rejected'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-white">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-2xl ${
                      page === i + 1 
                        ? "bg-blue-600 text-white" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    } transition-all duration-200`}
                  >
                    {i + 1}
                  </button>
                ))}
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
    </div>
  );
}
