'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

function getUnique(arr, key) {
  return [...new Set(arr.map(item => item[key]))];
}

export default function StudentRentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    month: '',
    year: '',
    paymentType: ''
  });
  
  // Available filter options
  const [categories, setCategories] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchHistory();
  }, [page, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.category && { categoryId: filters.category }),
        ...(filters.month && { month: filters.month }),
        ...(filters.year && { year: filters.year }),
        ...(filters.paymentType && { paymentType: filters.paymentType })
      });

      const response = await fetch(`/api/student/rent-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setHistory(data.history);
        setTotal(data.total);
        setSummary(data.summary);
        
        // Extract unique payment types for filter dropdown
        const types = getUnique(data.history, 'paymentType');
        setPaymentTypes(types);
      } else {
        throw new Error(data.message || 'Failed to fetch rent history');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Get category title from rent record
  const getCategoryTitle = (record) => {
    if (record.rent?.category?.title) {
      return record.rent.category.title;
    }
    return 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">📚 My Rent History</h1>
        <p className="text-gray-300 text-sm">View your detailed rent payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="text-gray-300 text-sm mb-1">Total Records</div>
          <div className="text-2xl font-bold text-white">{summary.totalRecords || 0}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="text-gray-300 text-sm mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalPaid || 0)}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="text-gray-300 text-sm mb-1">Total Due</div>
          <div className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalDue || 0)}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="text-gray-300 text-sm mb-1">Average Payment</div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(summary.averagePayment || 0)}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl mb-6">
        <h3 className="text-lg font-bold text-white mb-4">🔍 Filter Options</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Type</label>
            <select
              name="paymentType"
              value={filters.paymentType}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">All Types</option>
              {paymentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              🔍 Filter
            </button>
          </div>
        </form>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your rent history...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 backdrop-blur-lg rounded-3xl p-6 border border-red-500/30 shadow-2xl">
          <div className="flex items-center">
            <span className="text-red-400 text-lg mr-2">⚠️</span>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}
      
      {/* History Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">No History Found</h3>
              <p className="text-gray-300">No rent records match your current filters</p>
            </div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{getCategoryTitle(record)}</h3>
                    <p className="text-gray-300 text-sm">{record.rentMonth}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                    {record.status.toUpperCase()}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-500/20 rounded-2xl p-3 border border-red-500/30">
                    <div className="text-red-300 text-xs mb-1">Due Amount</div>
                    <div className="text-white font-bold">{formatCurrency(record.dueRent + record.dueAdvance + record.dueExternal)}</div>
                  </div>
                  <div className="bg-green-500/20 rounded-2xl p-3 border border-green-500/30">
                    <div className="text-green-300 text-xs mb-1">Paid Amount</div>
                    <div className="text-white font-bold">{formatCurrency(record.paidRent + record.paidAdvance + record.paidExternal)}</div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Rent Due: {formatCurrency(record.dueRent)}</span>
                    <span className="text-green-400">Paid: {formatCurrency(record.paidRent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Advance Due: {formatCurrency(record.dueAdvance)}</span>
                    <span className="text-green-400">Paid: {formatCurrency(record.paidAdvance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">External Due: {formatCurrency(record.dueExternal)}</span>
                    <span className="text-green-400">Paid: {formatCurrency(record.paidExternal)}</span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Payment Type:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.paymentType === 'on hand' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {record.paymentType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Payment Date:</span>
                    <span className="text-white">{formatDate(record.paidDate)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Pagination */}
      {total > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} records
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-white">
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
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
