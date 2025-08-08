"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const PAGE_SIZE = 10;

function ComplaintModal({ open, onClose, complaint, loading }) {
  if (!open || !complaint) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'checking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'solved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl p-6 relative animate-fadeIn border border-white/20 mx-4">
        <h2 className="text-xl font-semibold mb-6 text-white">Complaint Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Student Name</label>
              <div className="text-white font-medium">{complaint.student.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <div className="text-white">{complaint.student.phone}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Complaint Title</label>
            <div className="text-white font-medium">{complaint.title}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Details</label>
            <div className="text-white bg-white/10 p-3 rounded-2xl border border-white/20">{complaint.details}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Complain For</label>
              <div className="text-white capitalize">{complaint.complainFor}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Created At</label>
              <div className="text-white">{formatDate(complaint.createdAt)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Updated</label>
              <div className="text-white">{formatDate(complaint.updatedAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, complaint: null });
  const [filters, setFilters] = useState({
    status: "pending", // Default to pending
    search: "",
    complainFor: ""
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    checkingComplaints: 0,
    solvedComplaints: 0,
    canceledComplaints: 0
  });
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    fetchComplaints();
  }, [page, filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/complaint?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }

      const data = await response.json();
      setComplaints(data.complaints);
      setTotalPages(data.totalPages);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleView = (complaint) => {
    setModal({ open: true, complaint });
  };

  const handleClose = () => {
    setModal({ open: false, complaint: null });
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/complaint/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Complaint status updated to ${newStatus}`);
        fetchComplaints(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleCardExpansion = (complaintId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(complaintId)) {
      newExpanded.delete(complaintId);
    } else {
      newExpanded.add(complaintId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'checking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'solved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/30';
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
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Complaint Management</h1>
              <p className="text-gray-300 text-sm mt-1">Manage all student complaints</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Total Complaints</p>
              <p className="text-base font-bold text-white">{summary.totalComplaints}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Pending</p>
              <p className="text-base font-bold text-yellow-400">{summary.pendingComplaints}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Checking</p>
              <p className="text-base font-bold text-blue-400">{summary.checkingComplaints}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="text-center">
              <p className="text-gray-300 text-xs mb-1">Solved</p>
              <p className="text-base font-bold text-green-400">{summary.solvedComplaints}</p>
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
                  placeholder="Search by student name, phone, or title"
                />
              </div>
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
                  <option value="checking">Checking</option>
                  <option value="solved">Solved</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Complain For</label>
                <select
                  name="complainFor"
                  value={filters.complainFor}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Types</option>
                  <option value="mess">Mess</option>
                  <option value="room">Room</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ search: "", status: "pending", complainFor: "" });
                    setPage(1);
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading complaints...</p>
          </div>
        )}

        {/* Complaints Cards */}
        {!loading && (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <p className="text-white text-lg">No complaints found</p>
                <p className="text-gray-300 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              complaints.map((complaint) => {
                const isExpanded = expandedCards.has(complaint.id);
                
                return (
                  <div key={complaint.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Card Header - Collapsed State */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                      onClick={() => toggleCardExpansion(complaint.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{complaint.student.name}</h3>
                            <p className="text-gray-300 text-xs truncate">{complaint.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
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
                        {/* Complaint Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Complaint Details</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Student Name:</span>
                              <span className="text-white font-medium truncate">{complaint.student.name}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Student Phone:</span>
                              <span className="text-white truncate">{complaint.student.phone}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Complaint Title:</span>
                              <span className="text-white font-medium truncate">{complaint.title}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Complain For:</span>
                              <span className="text-white capitalize truncate">{complaint.complainFor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Complaint Information */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Complaint Information</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Created At:</span>
                              <span className="text-white truncate">{formatDate(complaint.createdAt)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Last Updated:</span>
                              <span className="text-white truncate">{formatDate(complaint.updatedAt)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Complaint ID:</span>
                              <span className="text-white truncate">{complaint.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Complaint Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Details</h4>
                          <div className="text-white text-xs bg-white/10 p-3 rounded-2xl border border-white/20">
                            {complaint.details}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleView(complaint)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                          >
                            View Details
                          </button>
                          {complaint.status === 'pending' && (
                            <div className="flex gap-1 flex-1">
                              <button
                                onClick={() => handleStatusChange(complaint.id, 'checking')}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-2 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs"
                              >
                                Checking
                              </button>
                              <button
                                onClick={() => handleStatusChange(complaint.id, 'solved')}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2 px-2 rounded-2xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-xs"
                              >
                                Solved
                              </button>
                              <button
                                onClick={() => handleStatusChange(complaint.id, 'canceled')}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-2 rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {complaint.status === 'checking' && (
                            <div className="flex gap-1 flex-1">
                              <button
                                onClick={() => handleStatusChange(complaint.id, 'solved')}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2 px-2 rounded-2xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-xs"
                              >
                                Solved
                              </button>
                              <button
                                onClick={() => handleStatusChange(complaint.id, 'canceled')}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-2 rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs"
                              >
                                Cancel
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

      <ComplaintModal
        open={modal.open}
        onClose={handleClose}
        complaint={modal.complaint}
        loading={loading}
      />
    </div>
  );
} 