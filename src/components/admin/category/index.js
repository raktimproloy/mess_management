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
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn border border-gray-700">
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
      
      {/* Debug Section */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Auth Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              authStatus === 'authenticated'
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : authStatus === 'checking'
                ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {authStatus === 'authenticated' ? 'Authenticated' : 
               authStatus === 'checking' ? 'Checking...' : 'Not Authenticated'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={debugAuth}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Debug Auth
            </button>
            <button
              onClick={testAuth}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Auth
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </button>
          </div>
        </div>
        
        {showDebug && (
          <div className="mt-3 p-3 bg-gray-700 rounded text-xs text-gray-300">
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
                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Clear Auth Data
              </button>
              <button
                onClick={() => {
                  isAuthenticated();
                  toast.success('Refreshed auth status');
                }}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Refresh Status
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Category Management</h1>
          <p className="text-gray-400">Manage room categories and pricing</p>
          {authStatus === 'not_authenticated' && (
            <p className="text-yellow-400 text-sm mt-1">⚠️ Admin login required for modifications</p>
          )}
        </div>
        <button
          onClick={handleAdd}
          className={`px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
            authStatus === 'authenticated'
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800 border border-gray-700">
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading categories...</span>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Rent Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">External Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-lg">No categories found</span>
                      <p className="text-sm">Create your first category to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-300">{cat.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{cat.title}</td>
                    <td className="px-6 py-4 text-sm text-green-400">৳{cat.rentAmount}</td>
                    <td className="px-6 py-4 text-sm text-blue-400">৳{cat.externalAmount}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{cat.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(cat.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        cat.status === 1 
                          ? 'bg-green-900 text-green-300 border border-green-700' 
                          : 'bg-red-900 text-red-300 border border-red-700'
                      }`}>
                        {cat.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(cat)}
                          className="p-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors duration-200"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(cat)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            authStatus === 'authenticated'
                              ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          title={authStatus === 'authenticated' ? "Edit" : "Login required"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            authStatus === 'authenticated'
                              ? 'bg-red-600 text-white hover:bg-red-500' 
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          title={authStatus === 'authenticated' ? "Delete" : "Login required"}
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
