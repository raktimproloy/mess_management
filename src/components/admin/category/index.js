"use client"
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function CategoryModal({ open, onClose, onSave, category, mode, loading }) {
  const [form, setForm] = useState({
    title: '',
    rentAmount: '',
    externalAmount: '',
    description: '',
    status: 1
  });

  React.useEffect(() => {
    if (category) {
      setForm({
        title: category.title || '',
        rentAmount: category.rentAmount || '',
        externalAmount: category.externalAmount || '',
        description: category.description || '',
        status: category.status || 1
      });
    } else {
      setForm({
        title: '',
        rentAmount: '',
        externalAmount: '',
        description: '',
        status: 1
      });
    }
  }, [category, open]);

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
          {mode === 'add' ? 'Add New Category' : mode === 'edit' ? 'Edit Category' : 'View Category'}
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
              placeholder="Enter category title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rent Amount</label>
            <input
              name="rentAmount"
              type="number"
              value={form.rentAmount}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              required
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed"
              placeholder="Enter rent amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">External Amount</label>
            <input
              name="externalAmount"
              type="number"
              value={form.externalAmount}
              onChange={handleChange}
              disabled={mode === 'view' || loading}
              className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg disabled:bg-white/5 disabled:cursor-not-allowed"
              placeholder="Enter external amount"
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

export default function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', category: null });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [authStatus, setAuthStatus] = useState('checking');
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Get auth token from localStorage with better error handling
  const getAuthToken = () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = getAuthToken();
    const isAuth = !!token;
    setAuthStatus(isAuth ? 'authenticated' : 'not_authenticated');
    return isAuth;
  };

  // Debug function to show token info
  const debugAuth = () => {
    const token = getAuthToken();
    const adminData = localStorage.getItem('adminData');
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('Admin data exists:', !!adminData);
    if (adminData) {
      try {
        console.log('Admin data:', JSON.parse(adminData));
      } catch (e) {
        console.log('Admin data parse error:', e);
      }
    }
    console.log('==================');
  };

  // Test authentication with API
  const testAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('No token found');
      return;
    }

    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Category',
          rentAmount: 1000,
          externalAmount: 100,
          description: 'Test category for auth verification',
          status: 1
        })
      });

      const data = await response.json();
      console.log('Auth test response:', data);
      
      if (data.success) {
        toast.success('Authentication test successful!');
        // Clean up the test category
        setTimeout(() => {
          fetchCategories();
        }, 1000);
      } else {
        toast.error(`Auth test failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Auth test error:', error);
      toast.error('Authentication test failed');
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setFetching(true);
      const response = await fetch('/api/category');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setFetching(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
    // Check authentication status
    isAuthenticated();
  }, []);

  // Real-time updates - fetch every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCategories();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAdd = () => {
    if (!isAuthenticated()) {
      toast.error('Please login as admin to create categories');
      return;
    }
    setModal({ open: true, mode: 'add', category: null });
  };
  
  const handleEdit = (cat) => {
    if (!isAuthenticated()) {
      toast.error('Please login as admin to edit categories');
      return;
    }
    setModal({ open: true, mode: 'edit', category: cat });
  };
  
  const handleView = (cat) => setModal({ open: true, mode: 'view', category: cat });
  const handleClose = () => setModal({ open: false, mode: 'add', category: null });

  const toggleCardExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
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
        response = await fetch('/api/category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else if (modal.mode === 'edit') {
        response = await fetch(`/api/category/${modal.category.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(modal.mode === 'add' ? 'Category created successfully!' : 'Category updated successfully!');
        handleClose();
        fetchCategories(); // Refresh the list
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
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

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/category/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          toast.success('Category deleted successfully!');
          fetchCategories(); // Refresh the list
        } else {
          toast.error(data.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
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
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Category Management</h1>
              <p className="text-gray-300 text-sm mt-1">Manage room categories and pricing</p>
              {authStatus === 'not_authenticated' && (
                <p className="text-yellow-400 text-xs mt-1">⚠️ Admin login required for modifications</p>
              )}
            </div>
            <button
              onClick={handleAdd}
              className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                authStatus === 'authenticated'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Debug Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Auth Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                authStatus === 'authenticated'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : authStatus === 'checking'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {authStatus === 'authenticated' ? 'Authenticated' : 
                 authStatus === 'checking' ? 'Checking...' : 'Not Authenticated'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={debugAuth}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200"
              >
                Debug Auth
              </button>
              <button
                onClick={testAuth}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200"
              >
                Test Auth
              </button>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200"
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </button>
            </div>
          </div>
          
          {showDebug && (
            <div className="mt-3 p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-300">
              <div><strong>Token:</strong> {getAuthToken() ? 'Present' : 'Missing'}</div>
              <div><strong>Admin Data:</strong> {localStorage.getItem('adminData') ? 'Present' : 'Missing'}</div>
              <div><strong>Window:</strong> {typeof window !== 'undefined' ? 'Available' : 'Not Available'}</div>
              <div><strong>Auth Status:</strong> {authStatus}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                    setAuthStatus('not_authenticated');
                    toast.success('Cleared auth data');
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded-2xl text-xs hover:bg-red-700 transition-all duration-200"
                >
                  Clear Auth Data
                </button>
                <button
                  onClick={() => {
                    isAuthenticated();
                    toast.success('Refreshed auth status');
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded-2xl text-xs hover:bg-blue-700 transition-all duration-200"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {fetching && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading categories...</p>
          </div>
        )}

        {/* Categories Cards */}
        {!fetching && (
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-lg text-white">No categories found</span>
                  <p className="text-sm text-gray-300">Create your first category to get started</p>
                </div>
              </div>
            ) : (
              categories.map((cat) => {
                const isExpanded = expandedCards.has(cat.id);
                
                return (
                  <div key={cat.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Card Header - Collapsed State */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                      onClick={() => toggleCardExpansion(cat.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{cat.title}</h3>
                            <p className="text-gray-300 text-xs truncate">Rent: {formatCurrency(cat.rentAmount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(cat.status)}`}>
                            {cat.status === 1 ? 'Active' : 'Inactive'}
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
                        {/* Category Details */}
                        <div className="bg-white/5 rounded-2xl p-4">
                          <h4 className="text-white font-medium mb-3">Category Details</h4>
                          <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Title:</span>
                              <span className="text-white font-medium truncate">{cat.title}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Rent Amount:</span>
                              <span className="text-green-400 font-medium truncate">{formatCurrency(cat.rentAmount)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">External Amount:</span>
                              <span className="text-blue-400 font-medium truncate">{formatCurrency(cat.externalAmount)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(cat.status)}`}>
                                {cat.status === 1 ? 'Active' : 'Inactive'}
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
                              <span className="text-white truncate max-w-48">{cat.description || 'No description'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Created:</span>
                              <span className="text-white truncate">{formatDate(cat.createdAt)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-gray-300">Category ID:</span>
                              <span className="text-white truncate">{cat.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleView(cat)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEdit(cat)}
                            className={`flex-1 font-semibold py-2 px-4 rounded-2xl shadow-lg transition-all duration-200 ${
                              authStatus === 'authenticated'
                                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800' 
                                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            }`}
                            title={authStatus === 'authenticated' ? "Edit" : "Login required"}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className={`flex-1 font-semibold py-2 px-4 rounded-2xl shadow-lg transition-all duration-200 ${
                              authStatus === 'authenticated'
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800' 
                                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            }`}
                            title={authStatus === 'authenticated' ? "Delete" : "Login required"}
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

      <CategoryModal
        open={modal.open}
        onClose={handleClose}
        onSave={handleSave}
        category={modal.category}
        mode={modal.mode}
        loading={loading}
      />
    </div>
  );
}
