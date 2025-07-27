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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
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

  return (
    <div className="p-6 min-h-screen bg-[#18181b] dark:bg-[#18181b]">
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
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Rent History</h1>
        <p className="text-gray-400">View and filter all rent payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#232329] p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Records</h3>
          <p className="text-2xl font-bold text-white">{summary.totalRecords || 0}</p>
        </div>
        <div className="bg-[#232329] p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Paid</h3>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalPaid || 0)}</p>
        </div>
        <div className="bg-[#232329] p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Due</h3>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalDue || 0)}</p>
        </div>
        <div className="bg-[#232329] p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Average Payment</h3>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.averagePayment || 0)}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-[#232329] p-4 rounded-lg mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
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
            <label className="block text-sm font-medium text-white mb-1">Month</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
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
            <label className="block text-sm font-medium text-white mb-1">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">Payment Type</label>
            <select
              name="paymentType"
              value={filters.paymentType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
            >
              <option value="">All Types</option>
              {paymentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Student name or phone"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#18181b] text-white border-gray-600"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-400">Loading...</span>
        </div>
      )}
      
      {error && (
        <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}
      
      {/* History Table */}
      <div className="bg-[#232329] rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#18181b]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Payment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Due Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#232329] divide-y divide-gray-700">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-[#18181b] transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {record.student?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {record.student?.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getCategoryTitle(record)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {record.rentMonth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.paymentType === 'on hand' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {record.paymentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(record.dueRent + record.dueAdvance + record.dueExternal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                    {formatCurrency(record.paidRent + record.paidAdvance + record.paidExternal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(record.paidDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : record.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {total > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-white">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-white">
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
