'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

function getUnique(arr, key) {
  return [...new Set(arr.map(item => item[key]))];
}

export default function RentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({});
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    month: '',
    year: '',
    paymentType: '',
    search: ''
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
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.category && { categoryId: filters.category }),
        ...(filters.month && { month: filters.month }),
        ...(filters.year && { year: filters.year }),
        ...(filters.paymentType && { paymentType: filters.paymentType }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/rent/history?${params}`);
      const data = await response.json();
      
      if (response.ok) {
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

  const toggleCardExpansion = (recordId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedCards(newExpanded);
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
    return `৳${amount.toLocaleString()}`;
  };

  // Get category title from student's category or rent record
  const getCategoryTitle = (record) => {
    if (record.student?.categoryRef?.title) {
      return record.student.categoryRef.title;
    }
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

  const getPaymentTypeColor = (paymentType) => {
    switch (paymentType) {
      case 'on hand': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'online': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
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
               <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Rent History</h1>
               <p className="text-gray-300 text-sm mt-1">View and filter all rent payment history</p>
             </div>
           </div>
         </div>
       </div>

      <div className="p-4 space-y-6">
                 {/* Summary Cards */}
         <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
             <div className="text-center">
               <p className="text-gray-300 text-xs mb-1">Total Records</p>
               <p className="text-base font-bold text-white">{summary.totalRecords || 0}</p>
             </div>
           </div>

           <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
             <div className="text-center">
               <p className="text-gray-300 text-xs mb-1">Total Paid</p>
               <p className="text-base font-bold text-green-400">{formatCurrency(summary.totalPaid || 0)}</p>
             </div>
           </div>

           <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
             <div className="text-center">
               <p className="text-gray-300 text-xs mb-1">Total Due</p>
               <p className="text-base font-bold text-red-400">{formatCurrency(summary.totalDue || 0)}</p>
             </div>
           </div>

           <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
             <div className="text-center">
               <p className="text-gray-300 text-xs mb-1">Average Payment</p>
               <p className="text-base font-bold text-blue-400">{formatCurrency(summary.averagePayment || 0)}</p>
             </div>
           </div>
         </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Student name or phone"
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
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
                <label className="block text-sm font-medium text-white mb-2">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Payment Type</label>
                <select
                  name="paymentType"
                  value={filters.paymentType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white border-white/20 backdrop-blur-lg"
                >
                  <option value="">All Types</option>
                  {paymentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

                         <button
               type="submit"
               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
             >
               Search
             </button>
          </form>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading history...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 backdrop-blur-lg rounded-3xl p-4 border border-red-500/20 shadow-2xl">
            <div className="text-red-400 text-center">{error}</div>
          </div>
        )}

        {/* History Cards */}
        <div className="space-y-4">
                     {!loading && !error && history.length === 0 ? (
             <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
               <p className="text-white text-lg">No history found</p>
               <p className="text-gray-300 text-sm mt-2">Try adjusting your search criteria</p>
             </div>
          ) : (
            history.map((record) => {
              const isExpanded = expandedCards.has(record.id);
              const totalDue = record.dueRent + record.dueAdvance + record.dueExternal;
              const totalPaid = record.paidRent + record.paidAdvance + record.paidExternal;

              return (
                <div key={record.id} className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Card Header - Collapsed State */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                    onClick={() => toggleCardExpansion(record.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {record.student?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div> */}
                                                 <div className="flex-1 min-w-0">
                           <h3 className="text-white font-semibold text-sm truncate">{record.student?.name || 'N/A'}</h3>
                           <p className="text-gray-300 text-xs truncate">{formatCurrency(totalPaid)} paid</p>
                         </div>
                      </div>
                                               <div className="flex items-center space-x-2">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(record.status)}`}>
                             {record.status}
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
                                             {/* Student & Category Info */}
                       <div className="bg-white/5 rounded-2xl p-4">
                         <h4 className="text-white font-medium mb-3">Student & Category Details</h4>
                                                 <div className="grid grid-cols-1 gap-3 text-sm">
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300 text-xs">Student Name:</span>
                             <span className="text-white font-medium truncate">{record.student?.name || 'N/A'}</span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300 text-xs">Student Phone:</span>
                             <span className="text-white truncate">{record.student?.phone || 'N/A'}</span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300 text-xs">Category:</span>
                             <span className="text-white font-medium truncate">{getCategoryTitle(record)}</span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300 text-xs">Month:</span>
                             <span className="text-white truncate">{record.rentMonth}</span>
                           </div>
                         </div>
                      </div>

                      {/* Payment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                 {/* Due Amounts */}
                         <div className="bg-white/5 rounded-2xl p-4">
                           <h4 className="text-red-300 font-medium mb-3">Due Amounts</h4>
                                                     <div className="space-y-2 text-xs">
                             <div className="flex justify-between items-center">
                               <span className="text-gray-300">Rent Due:</span>
                               <span className="text-white font-medium truncate ml-2">{formatCurrency(record.dueRent)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-gray-300">Advance Due:</span>
                               <span className="text-white font-medium truncate ml-2">{formatCurrency(record.dueAdvance)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-gray-300">External Due:</span>
                               <span className="text-white font-medium truncate ml-2">{formatCurrency(record.dueExternal)}</span>
                             </div>
                             <div className="flex justify-between items-center pt-2 border-t border-white/10">
                               <span className="text-gray-300 font-medium">Total Due:</span>
                               <span className="text-red-400 font-bold truncate ml-2">{formatCurrency(totalDue)}</span>
                             </div>
                           </div>
                        </div>

                                                 {/* Paid Amounts */}
                         <div className="bg-white/5 rounded-2xl p-4">
                           <h4 className="text-green-300 font-medium mb-3">Paid Amounts</h4>
                                                     <div className="space-y-2 text-xs">
                             <div className="flex justify-between items-center">
                               <span className="text-gray-300">Rent Paid:</span>
                               <span className="text-green-400 font-medium truncate ml-2">{formatCurrency(record.paidRent)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-gray-300">Advance Paid:</span>
                               <span className="text-green-400 font-medium truncate ml-2">{formatCurrency(record.paidAdvance)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <span className="text-gray-300">External Paid:</span>
                               <span className="text-green-400 font-medium truncate ml-2">{formatCurrency(record.paidExternal)}</span>
                             </div>
                             <div className="flex justify-between items-center pt-2 border-t border-white/10">
                               <span className="text-gray-300 font-medium">Total Paid:</span>
                               <span className="text-green-400 font-bold truncate ml-2">{formatCurrency(totalPaid)}</span>
                             </div>
                           </div>
                        </div>
                      </div>

                                             {/* Payment Info */}
                       <div className="bg-white/5 rounded-2xl p-4">
                         <h4 className="text-white font-medium mb-3">Payment Information</h4>
                                                 <div className="grid grid-cols-1 gap-3 text-xs">
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300">Payment Date:</span>
                             <span className="text-white truncate">{formatDate(record.paidDate)}</span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300">Payment Type:</span>
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-24 ${getPaymentTypeColor(record.paymentType)}`}>
                               {record.paymentType}
                             </span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300">Status:</span>
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate max-w-20 ${getStatusColor(record.status)}`}>
                               {record.status}
                             </span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="text-gray-300">Record ID:</span>
                             <span className="text-white truncate">{record.id}</span>
                           </div>
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
        {total > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-white">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-white bg-white/10 rounded-2xl">
                  Page {page} of {Math.ceil(total / pageSize)}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-4 py-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
