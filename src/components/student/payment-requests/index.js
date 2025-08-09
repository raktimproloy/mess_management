"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 10;

export default function PaymentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [summary, setSummary] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchPaymentRequests();
  }, [page]);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch(`/api/payment-request?page=${page}&limit=${PAGE_SIZE}`, {
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

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this payment request?')) {
      return;
    }

    try {
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch(`/api/payment-request/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment request');
      }

      toast.success('Payment request deleted successfully!');
      fetchPaymentRequests(); // Refresh data
    } catch (error) {
      console.error('Error deleting payment request:', error);
      toast.error('Failed to delete payment request');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleCard = (requestId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading payment requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">💳 Payment Requests</h1>
        <p className="text-gray-300 text-sm">Track and manage your payment requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-gray-300 text-xs mb-1">Total</div>
          <div className="text-white text-lg font-bold">{summary.totalRequests}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-yellow-300 text-xs mb-1">Pending</div>
          <div className="text-yellow-400 text-lg font-bold">{summary.pendingRequests}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-green-300 text-xs mb-1">Approved</div>
          <div className="text-green-400 text-lg font-bold">{summary.approvedRequests}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-red-300 text-xs mb-1">Rejected</div>
          <div className="text-red-400 text-lg font-bold">{summary.rejectedRequests}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl col-span-2 lg:col-span-1">
          <div className="text-gray-300 text-xs mb-1">Total Amount</div>
          <div className="text-white text-lg font-bold">{formatCurrency(summary.totalAmount)}</div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">No Payment Requests</h3>
            <p className="text-gray-300">You haven't made any payment requests yet</p>
          </div>
        ) : (
          requests.map((request) => {
            const isExpanded = expandedCards.has(request.id);
            
            return (
              <div key={request.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header - Always visible */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {formatCurrency(request.totalAmount)}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {request.rent ? formatDate(request.rent.createdAt) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </div>
                      <button
                        onClick={() => toggleCard(request.id)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                      >
                        <svg 
                          className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Basic Info - Always visible */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                      <div className="text-gray-300 text-xs mb-1">Request Date</div>
                      <div className="text-white text-sm font-medium">{formatDate(request.createdAt)}</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                      <div className="text-gray-300 text-xs mb-1">Payment Method</div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(request.paymentMethod)}`}>
                        {request.paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-white/10">
                    <div className="pt-4 space-y-4">
                      {/* Amount Breakdown */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-3">📊 Amount Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Rent Amount:</span>
                            <span className="text-white font-medium">{formatCurrency(request.rentAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Advance Amount:</span>
                            <span className="text-white font-medium">{formatCurrency(request.advanceAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">External Amount:</span>
                            <span className="text-white font-medium">{formatCurrency(request.externalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Previous Due:</span>
                            <span className="text-white font-medium">{formatCurrency(request.previousDueAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Online Payment Details */}
                      {request.paymentMethod === 'online' && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <h4 className="text-white font-medium text-sm mb-3">💳 Online Payment Details</h4>
                          <div className="space-y-2 text-sm">
                            {request.bikashNumber && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Bikash Number:</span>
                                <span className="text-white">{request.bikashNumber}</span>
                              </div>
                            )}
                            {request.trxId && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Transaction ID:</span>
                                <span className="text-white text-xs">{request.trxId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Request Details */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <h4 className="text-white font-medium text-sm mb-3">📋 Request Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Request ID:</span>
                            <span className="text-white text-xs">{request.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Created:</span>
                            <span className="text-white">{formatDate(request.createdAt)}</span>
                          </div>
                          {request.updatedAt && request.updatedAt !== request.createdAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Last Updated:</span>
                              <span className="text-white">{formatDate(request.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="flex-1 py-3 px-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 font-medium hover:bg-red-500/30 transition-all duration-300"
                          >
                            ❌ Cancel Request
                          </button>
                        </div>
                      )}
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
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                ← Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      page === pageNum 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
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
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 