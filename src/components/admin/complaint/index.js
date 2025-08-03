"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'checking': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'solved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'canceled': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative animate-fadeIn border border-gray-700">
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
            <div className="text-white bg-gray-700 p-3 rounded-lg">{complaint.details}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Complain For</label>
              <div className="text-white capitalize">{complaint.complainFor}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
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
            className="px-6 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
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
          <h1 className="text-2xl font-bold text-white mb-2">Complaint Management</h1>
          <p className="text-gray-400">Manage all student complaints</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Canceled</div>
          <div className="text-2xl font-bold text-red-400">{summary.canceledComplaints}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by student name, phone, or title"
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Complain For</label>
            <select
              name="complainFor"
              value={filters.complainFor}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Student</th>
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
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No complaints found.</td>
                </tr>
              ) : (
                complaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">
                      <div>
                        <div className="font-medium">{comp.student.name}</div>
                        <div className="text-gray-400 text-xs">{comp.student.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{comp.title}</td>
                    <td className="px-4 py-3 text-sm text-white capitalize">{comp.complainFor}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{formatDate(comp.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleView(comp)}
                          className="px-3 py-1 border border-gray-500 rounded hover:bg-gray-600 text-gray-300 transition text-xs"
                        >
                          View Details
                        </button>
                        {comp.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(comp.id, 'checking')}
                              className="px-2 py-1 border border-blue-500 rounded hover:bg-blue-600 text-blue-300 transition text-xs"
                            >
                              Checking
                            </button>
                            <button
                              onClick={() => handleStatusChange(comp.id, 'solved')}
                              className="px-2 py-1 border border-green-500 rounded hover:bg-green-600 text-green-300 transition text-xs"
                            >
                              Solved
                            </button>
                            <button
                              onClick={() => handleStatusChange(comp.id, 'canceled')}
                              className="px-2 py-1 border border-red-500 rounded hover:bg-red-600 text-red-300 transition text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {comp.status === 'checking' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(comp.id, 'solved')}
                              className="px-2 py-1 border border-green-500 rounded hover:bg-green-600 text-green-300 transition text-xs"
                            >
                              Solved
                            </button>
                            <button
                              onClick={() => handleStatusChange(comp.id, 'canceled')}
                              className="px-2 py-1 border border-red-500 rounded hover:bg-red-600 text-red-300 transition text-xs"
                            >
                              Cancel
                            </button>
                          </div>
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
        complaint={modal.complaint}
        loading={loading}
      />
    </div>
  );
} 