"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        toast.error(data.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'checking': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'solved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'canceled': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
        <p className="text-gray-400">Welcome back, {dashboardData.student.name}!</p>
      </div>

      {/* Student Info Card */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {dashboardData.student.profileImage ? (
              <img 
                src={dashboardData.student.profileImage} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{dashboardData.student.name}</h2>
              <p className="text-gray-400">{dashboardData.student.phone}</p>
              <p className="text-sm text-gray-500">Living for {dashboardData.student.livingMonths} months</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Category</p>
            <p className="text-white font-semibold">{dashboardData.category.title}</p>
            <p className="text-green-400 text-sm">{formatCurrency(dashboardData.category.rentAmount)}/month</p>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Current Month Rent */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Current Month</p>
              <p className="text-3xl font-bold text-white mt-2">
                {dashboardData.currentRent ? formatCurrency(dashboardData.currentRent.remainingDue) : 'N/A'}
              </p>
              <p className="text-red-400 text-sm mt-1">Due Amount</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Paid</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {formatCurrency(dashboardData.rentHistory.totalPaid)}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {dashboardData.rentHistory.total} payments
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        {/* Complaints */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Complaints</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{dashboardData.complaints.total}</p>
              <p className="text-gray-400 text-sm mt-1">
                {dashboardData.complaints.pending} pending
              </p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        {/* Payment Requests */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Payment Requests</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{dashboardData.payments.totalRequests}</p>
              <p className="text-gray-400 text-sm mt-1">
                {dashboardData.payments.pending} pending
              </p>
            </div>
            <div className="text-4xl">💳</div>
          </div>
        </div>
      </div>

      {/* Current Month Details */}
      {dashboardData.currentRent && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Current Month Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Rent Amount</p>
              <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.rentAmount)}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Advance</p>
              <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.advanceAmount)}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">External</p>
              <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.externalAmount)}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Previous Due</p>
              <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.previousDue)}</p>
            </div>
            {dashboardData.currentRent.discountAmount > 0 && (
              <div className="p-4 bg-green-900 rounded-lg">
                <p className="text-green-400 text-sm">Discount</p>
                <p className="text-green-300 font-semibold">-{formatCurrency(dashboardData.currentRent.discountAmount)}</p>
              </div>
            )}
            <div className="p-4 bg-red-900 rounded-lg">
              <p className="text-red-400 text-sm">Total Due</p>
              <p className="text-red-300 font-semibold">{formatCurrency(dashboardData.currentRent.totalDue)}</p>
            </div>
            <div className="p-4 bg-blue-900 rounded-lg">
              <p className="text-blue-400 text-sm">Paid Amount</p>
              <p className="text-blue-300 font-semibold">{formatCurrency(dashboardData.currentRent.paidAmount)}</p>
            </div>
            <div className="p-4 bg-yellow-900 rounded-lg">
              <p className="text-yellow-400 text-sm">Remaining</p>
              <p className="text-yellow-300 font-semibold">{formatCurrency(dashboardData.currentRent.remainingDue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Discount Information */}
      {dashboardData.discount && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Discount Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-900 rounded-lg">
              <p className="text-green-400 text-sm">Discount Title</p>
              <p className="text-green-300 font-semibold">{dashboardData.discount.title}</p>
            </div>
            <div className="p-4 bg-green-900 rounded-lg">
              <p className="text-green-400 text-sm">Type</p>
              <p className="text-green-300 font-semibold capitalize">{dashboardData.discount.type}</p>
            </div>
            <div className="p-4 bg-green-900 rounded-lg">
              <p className="text-green-400 text-sm">Amount</p>
              <p className="text-green-300 font-semibold">
                {dashboardData.discount.type === 'percent' ? `${dashboardData.discount.amount}%` : formatCurrency(dashboardData.discount.amount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rent Statistics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Rent Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Rents</span>
              <span className="text-white font-semibold">{dashboardData.rents.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Paid Rents</span>
              <span className="text-green-400 font-semibold">{dashboardData.rents.paid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Unpaid Rents</span>
              <span className="text-red-400 font-semibold">{dashboardData.rents.unpaid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Partial Payments</span>
              <span className="text-yellow-400 font-semibold">{dashboardData.rents.partial}</span>
            </div>
          </div>
        </div>

        {/* Complaint Statistics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Complaint Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Complaints</span>
              <span className="text-white font-semibold">{dashboardData.complaints.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending</span>
              <span className="text-yellow-400 font-semibold">{dashboardData.complaints.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Checking</span>
              <span className="text-blue-400 font-semibold">{dashboardData.complaints.checking}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Solved</span>
              <span className="text-green-400 font-semibold">{dashboardData.complaints.solved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Complaints */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {dashboardData.complaints.recent.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent complaints</p>
            ) : (
              dashboardData.complaints.recent.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{complaint.title}</p>
                    <p className="text-gray-400 text-sm">{complaint.complainFor}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payment Requests */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Payment Requests</h3>
          <div className="space-y-3">
            {dashboardData.payments.recent.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent payment requests</p>
            ) : (
              dashboardData.payments.recent.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{formatCurrency(request.totalAmount)}</p>
                    <p className="text-gray-400 text-sm">{request.paymentMethod}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Monthly Payment Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboardData.monthlyStats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">{stat.month}</p>
              <p className="text-white font-semibold mt-1">{formatCurrency(stat.totalPaid)}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.paymentCount} payments</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
