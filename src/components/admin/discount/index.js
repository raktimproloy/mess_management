'use client'
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const discountTypeOptions = [
  { value: 'percent', label: 'Percent (%)' },
  { value: 'tk', label: 'Taka (৳)' },
];

function DiscountModal({ open, onClose, onSave, discount, mode, loading }) {
  const [form, setForm] = useState({
    title: '',
    discountType: 'percent',
    discountAmount: '',
    description: '',
    status: 1,
  });

  useEffect(() => {
    if (discount) {
      setForm({
        title: discount.title || '',
        discountType: discount.discountType || 'percent',
        discountAmount: discount.discountAmount || '',
        description: discount.description || '',
        status: discount.status || 1,
      });
    } else {
      setForm({
        title: '',
        discountType: 'percent',
        discountAmount: '',
        description: '',
        status: 1,
      });
    }
  }, [discount, open]);

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
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-white/20 mx-4">
        <h2 className="text-xl font-semibold mb-6 text-white">
          {mode === 'add' ? 'Add New Discount' : mode === 'edit' ? 'Edit Discount' : 'View Discount'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              required
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed"
              placeholder="Enter discount title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discount Type</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed"
            >
              {discountTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discount Amount</label>
            <input
              name="discountAmount"
              type="number"
              value={form.discountAmount}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              required
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed"
              placeholder="Enter discount amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              rows="3"
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed resize-none"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DiscountTable() {
  const [discounts, setDiscounts] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', discount: null });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  };

  // Fetch discounts from API
  const fetchDiscounts = async () => {
    try {
      setFetching(true);
      const response = await fetch('/api/discount');
      const data = await response.json();
      if (data.success) {
        setDiscounts(data.discounts);
      } else {
        toast.error('Failed to fetch discounts');
      }
    } catch (error) {
      toast.error('Failed to fetch discounts');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleAdd = () => {
    setModal({ open: true, mode: 'add', discount: null });
  };

  const handleEdit = (discount) => {
    setModal({ open: true, mode: 'edit', discount });
  };

  const handleView = (discount) => setModal({ open: true, mode: 'view', discount });
  const handleClose = () => setModal({ open: false, mode: 'add', discount: null });

  const toggleCardExpansion = (discountId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(discountId)) {
      newExpanded.delete(discountId);
    } else {
      newExpanded.add(discountId);
    }
    setExpandedCards(newExpanded);
  };

  const handleSave = async (formData) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required. Please login as admin.');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (modal.mode === 'add') {
        response = await fetch('/api/discount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else if (modal.mode === 'edit') {
        response = await fetch('/api/discount', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...formData, id: modal.discount.id })
        });
      }
      const data = await response.json();
      if (data.success) {
        toast.success(modal.mode === 'add' ? 'Discount created successfully!' : 'Discount updated successfully!');
        handleClose();
        fetchDiscounts();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Failed to save discount');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required. Please login as admin.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        const response = await fetch(`/api/discount?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Discount deleted successfully!');
          fetchDiscounts();
        } else {
          toast.error(data.error || 'Failed to delete discount');
        }
      } catch (error) {
        toast.error('Failed to delete discount');
      }
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
    return `৳${amount?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 0: return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDiscountTypeColor = (type) => {
    switch (type) {
      case 'percent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'tk': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Discount Management</h1>
              <p className="text-gray-300 text-sm mt-1">Manage discounts for students</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200 transform  flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Discount
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Loading State */}
        {fetching && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading discounts...</p>
          </div>
        )}

        {/* Discounts Cards */}
        {!fetching && (
          <div className="space-y-4">
            {discounts.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-lg text-white">No discounts found</span>
                  <p className="text-sm text-gray-300">Create your first discount to get started</p>
                </div>
              </div>
            ) : (
              discounts.map((discount) => {
                const isExpanded = expandedCards.has(discount.id);
                
                return (
                  <div key={discount.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Card Header - Collapsed State */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                      onClick={() => toggleCardExpansion(discount.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{discount.title}</h3>
                            <p className="text-gray-300 text-xs truncate">
                              {discount.discountType === 'percent' ? `${discount.discountAmount}%` : formatCurrency(discount.discountAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(discount.status)}`}>
                            {discount.status === 1 ? 'Active' : 'Inactive'}
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
                        {/* Discount Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Discount Details</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Title:</span>
                              <span className="text-white font-medium truncate">{discount.title}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Type:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-24 ${getDiscountTypeColor(discount.discountType)}`}>
                                {discount.discountType === 'percent' ? 'Percent (%)' : 'Taka (৳)'}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Amount:</span>
                              <span className="text-green-400 font-medium truncate">
                                {discount.discountType === 'percent' ? `${discount.discountAmount}%` : formatCurrency(discount.discountAmount)}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(discount.status)}`}>
                                {discount.status === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Additional Information</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Description:</span>
                              <span className="text-white truncate max-w-48">{discount.description || 'No description'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Created:</span>
                              <span className="text-white truncate">{formatDate(discount.createdAt)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Discount ID:</span>
                              <span className="text-white truncate">{discount.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleView(discount)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEdit(discount)}
                            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <DiscountModal
        open={modal.open}
        onClose={handleClose}
        onSave={handleSave}
        discount={modal.discount}
        mode={modal.mode}
        loading={loading}
      />
    </div>
  );
}
