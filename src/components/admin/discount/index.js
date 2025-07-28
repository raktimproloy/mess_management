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
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-gray-700">
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed resize-none"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
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

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discount Management</h1>
          <p className="text-gray-400">Manage discounts for students</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Discount
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800 border border-gray-700">
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading discounts...</span>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-lg">No discounts found</span>
                      <p className="text-sm">Create your first discount to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-300">{discount.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{discount.title}</td>
                    <td className="px-6 py-4 text-sm text-blue-400">{discount.discountType === 'percent' ? 'Percent (%)' : 'Taka (৳)'}</td>
                    <td className="px-6 py-4 text-sm text-green-400">{discount.discountType === 'percent' ? `${discount.discountAmount}%` : `৳${discount.discountAmount}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{discount.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(discount.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        discount.status === 1 
                          ? 'bg-green-900 text-green-300 border border-green-700' 
                          : 'bg-red-900 text-red-300 border border-red-700'
                      }`}>
                        {discount.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(discount)}
                          className="p-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors duration-200"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(discount)}
                          className="p-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors duration-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors duration-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
