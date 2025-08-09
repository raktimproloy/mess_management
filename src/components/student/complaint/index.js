"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ComplaintModal from "./ComplaintModal";
import ComplaintCard from "./ComplaintCard";
import ComplaintFilters from "./ComplaintFilters";
import ComplaintSummary from "./ComplaintSummary";
import ComplaintPagination from "./ComplaintPagination";

const PAGE_SIZE = 10;

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const handleClearFilters = () => {
    setFilters({ search: "", status: "" });
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

    setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      toast.error('Authentication required.');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this complaint?')) {
      setActionLoading(true);
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
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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
      <ComplaintSummary summary={summary} />

      {/* Filters */}
      <ComplaintFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">No Complaints</h3>
            <p className="text-gray-300">You haven't submitted any complaints yet</p>
          </div>
        ) : (
          complaints.map((comp) => (
            <ComplaintCard
              key={comp.id}
              complaint={comp}
              isExpanded={expandedCards.has(comp.id)}
              onToggle={toggleCard}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLoading={actionLoading}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <ComplaintPagination 
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ComplaintModal
        open={modal.open}
        onClose={handleClose}
        onSave={handleSave}
        complaint={modal.complaint}
        mode={modal.mode}
        loading={actionLoading}
      />
    </div>
  );
}
