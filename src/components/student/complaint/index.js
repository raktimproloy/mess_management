"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 10;

function ComplaintModal({ open, onClose, onSave, complaint, mode, loading }) {
  const [form, setForm] = useState({
    title: '',
    details: '',
    complainFor: 'mess' // Default value
  });

  useEffect(() => {
    if (complaint) {
      setForm({
        title: complaint.title || '',
        details: complaint.details || '',
        complainFor: complaint.complainFor || 'mess'
      });
    } else {
      setForm({
        title: '',
        details: '',
        complainFor: 'mess'
      });
    }
  }, [complaint, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {mode === 'add' ? '📝 Create New Complaint' : mode === 'edit' ? '✏️ Edit Complaint' : '👁️ Complaint Details'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Complaint Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={mode === 'view' || loading}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300"
                placeholder="Enter complaint title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                disabled={mode === 'view' || loading}
                rows="4"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed resize-none transition-all duration-300"
                placeholder="Describe your complaint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Complain For</label>
              <select
                name="complainFor"
                value={form.complainFor}
                onChange={handleChange}
                disabled={mode === 'view' || loading || mode === 'edit'}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300"
              >
                <option value="mess">🍽️ Mess</option>
                <option value="room">🏠 Room</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Cancel
              </button>
              {mode !== 'view' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {loading ? 'Saving...' : '💾 Save'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', complaint: null });
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [filters, setFilters] = useState({
    status: "",
    search: ""
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

  useEffect(() => {
    fetchComplaints();
  }, [page, filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        ...filters
      });

      const response = await fetch(`/api/complaint?${queryParams}`, {
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

  const handleAdd = () => {
    setModal({ open: true, mode: 'add', complaint: null });
  };
  
  const handleEdit = (comp) => {
    setModal({ open: true, mode: 'edit', complaint: comp });
  };
  
  const handleView = (comp) => setModal({ open: true, mode: 'view', complaint: comp });
  const handleClose = () => setModal({ open: false, mode: 'add', complaint: null });

  const toggleCard = (complaintId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(complaintId)) {
        newSet.delete(complaintId);
      } else {
        newSet.add(complaintId);
      }
      return newSet;
    });
  };

  const handleSave = async (formData) => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      toast.error('Authentication required.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (modal.mode === 'add') {
        response = await fetch('/api/complaint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else if (modal.mode === 'edit') {
        response = await fetch(`/api/complaint/${modal.complaint.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: formData.title, details: formData.details })
        });
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(modal.mode === 'add' ? 'Complaint created successfully!' : 'Complaint updated successfully!');
        handleClose();
        fetchComplaints();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving complaint:', error);
      toast.error('Failed to save complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      toast.error('Authentication required.');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this complaint?')) {
      try {
        const response = await fetch(`/api/complaint/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          toast.success('Complaint canceled successfully!');
          fetchComplaints();
        } else {
          toast.error(data.error || 'Failed to cancel complaint');
        }
      } catch (error) {
        console.error('Error canceling complaint:', error);
        toast.error('Failed to cancel complaint');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">📋 My Complaints</h1>
        <p className="text-gray-300 text-sm">View and manage your complaints</p>
      </div>

      {/* Add Complaint Button */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Complaint
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-gray-300 text-xs mb-1">Total</div>
          <div className="text-white text-lg font-bold">{summary.totalComplaints}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-yellow-300 text-xs mb-1">Pending</div>
          <div className="text-yellow-400 text-lg font-bold">{summary.pendingComplaints}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-blue-300 text-xs mb-1">Checking</div>
          <div className="text-blue-400 text-lg font-bold">{summary.checkingComplaints}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="text-green-300 text-xs mb-1">Solved</div>
          <div className="text-green-400 text-lg font-bold">{summary.solvedComplaints}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20 shadow-xl">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search by Title</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Search complaint title"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="checking">Checking</option>
                <option value="solved">Solved</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ search: "", status: "" });
                  setPage(1);
                }}
                className="w-full py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">No Complaints</h3>
            <p className="text-gray-300">You haven't submitted any complaints yet</p>
          </div>
        ) : (
          complaints.map((comp) => {
            const isExpanded = expandedCards.has(comp.id);
            
            return (
              <div key={comp.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header - Always visible */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{comp.title}</h3>
                      <p className="text-gray-300 text-sm">{formatDate(comp.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(comp.status)}`}>
                        {comp.status.toUpperCase()}
                      </div>
                      <button
                        onClick={() => toggleCard(comp.id)}
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
                      <div className="text-gray-300 text-xs mb-1">Type</div>
                      <div className="text-white text-sm font-medium">
                        {comp.complainFor === 'mess' ? '🍽️ Mess' : '🏠 Room'}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                      <div className="text-gray-300 text-xs mb-1">Status</div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comp.status)}`}>
                        {comp.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-white/10">
                    <div className="pt-4 space-y-4">
                      {/* Complaint Details */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white mb-3">📋 Complaint Details</h4>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="text-gray-300 text-sm mb-2">Description:</div>
                          <div className="text-white text-sm leading-relaxed">{comp.details}</div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <h4 className="text-white font-medium text-sm mb-3">📊 Request Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Request ID:</span>
                            <span className="text-white text-xs">{comp.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Created:</span>
                            <span className="text-white">{formatDate(comp.createdAt)}</span>
                          </div>
                          {comp.updatedAt && comp.updatedAt !== comp.createdAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Last Updated:</span>
                              <span className="text-white">{formatDate(comp.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleView(comp)}
                          className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 transition-all duration-300"
                        >
                          👁️ View
                        </button>
                        {comp.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleEdit(comp)}
                              className="flex-1 py-3 px-4 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30 font-medium hover:bg-yellow-500/30 transition-all duration-300"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(comp.id)}
                              className="flex-1 py-3 px-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 font-medium hover:bg-red-500/30 transition-all duration-300"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        )}
                      </div>
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

      <ComplaintModal
        open={modal.open}
        onClose={handleClose}
        onSave={handleSave}
        complaint={modal.complaint}
        mode={modal.mode}
        loading={loading}
      />
    </div>
  );
}
