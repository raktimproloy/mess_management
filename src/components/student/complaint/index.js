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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-gray-700">
        <h2 className="text-xl font-semibold mb-6 text-white">
          {mode === 'add' ? 'Create New Complaint' : mode === 'edit' ? 'Edit Complaint' : 'Complaint Details'}
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed resize-none"
              placeholder="Describe your complaint"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Complain For</label>
            <select
              name="complainFor"
              value={form.complainFor}
              onChange={handleChange}
              disabled={mode === 'view' || loading || mode === 'edit'} // Cannot change complainFor after creation
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <option value="mess">Mess</option>
              <option value="room">Room</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', complaint: null });
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
        fetchComplaints(); // Refresh the list
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
          fetchComplaints(); // Refresh the list
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
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'checking': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'solved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'canceled': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
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
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Complaints</h1>
          <p className="text-gray-400">View and manage your complaints</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Complaint
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total Complaints</div>
          <div className="text-2xl font-bold text-white">{summary.totalComplaints}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{summary.pendingComplaints}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Checking</div>
          <div className="text-2xl font-bold text-blue-400">{summary.checkingComplaints}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Solved</div>
          <div className="text-2xl font-bold text-green-400">{summary.solvedComplaints}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search by Title</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search complaint title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Complain For</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No complaints found.</td>
                </tr>
              ) : (
                complaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{comp.title}</td>
                    <td className="px-4 py-3 text-sm text-white">{comp.complainFor}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{formatDate(comp.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(comp)}
                          className="px-3 py-1 border border-gray-500 rounded hover:bg-gray-600 text-gray-300 transition"
                        >
                          View
                        </button>
                        {comp.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleEdit(comp)}
                              className="px-3 py-1 border border-yellow-500 rounded hover:bg-yellow-600 text-yellow-300 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(comp.id)}
                              className="px-3 py-1 border border-red-500 rounded hover:bg-red-600 text-red-300 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
