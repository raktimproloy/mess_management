"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getAdminData, getStudentData } from '../../../lib/auth';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const adminData = getAdminData();
      const studentData = getStudentData();

      // If student is logged in, redirect to student dashboard
      if (studentData) {
        router.push('/student/dashboard');
        return;
      }

      // If no admin is logged in, redirect to login
      if (!adminData) {
        router.push('/login/admin');
        return;
      }

      // If admin is logged in, fetch dashboard data
      fetchDashboardData();
    };

    checkAuth();
  }, []); // Remove router from dependencies to prevent infinite re-renders

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/dashboard', {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening in your mess management system.</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboardData.students.total}</p>
              <p className="text-green-400 text-sm mt-1">
                {dashboardData.students.living} Living • {dashboardData.students.left} Left
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Total Rents */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Rents</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboardData.rents.total}</p>
              <p className="text-blue-400 text-sm mt-1">
                {dashboardData.rents.currentMonth} This Month
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Pending Complaints */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Pending Complaints</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{dashboardData.complaints.pending}</p>
              <p className="text-gray-400 text-sm mt-1">
                {dashboardData.complaints.total} Total
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
              <p className="text-3xl font-bold text-purple-400 mt-2">{dashboardData.payments.pendingRequests}</p>
              <p className="text-gray-400 text-sm mt-1">Pending</p>
            </div>
            <div className="text-4xl">💳</div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rent Statistics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Rent Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Paid Rents</span>
              <span className="text-green-400 font-semibold">
                {dashboardData.rents.summary.paid.count} ({formatCurrency(dashboardData.rents.summary.paid.amount)})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Unpaid Rents</span>
              <span className="text-red-400 font-semibold">
                {dashboardData.rents.summary.unpaid.count} ({formatCurrency(dashboardData.rents.summary.unpaid.amount)})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Partial Payments</span>
              <span className="text-yellow-400 font-semibold">
                {dashboardData.rents.summary.partial.count} ({formatCurrency(dashboardData.rents.summary.partial.amount)})
              </span>
            </div>
          </div>
        </div>

        {/* Complaint Statistics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Complaint Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending</span>
              <span className="text-yellow-400 font-semibold">{dashboardData.complaints.summary.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Checking</span>
              <span className="text-blue-400 font-semibold">{dashboardData.complaints.summary.checking}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Solved</span>
              <span className="text-green-400 font-semibold">{dashboardData.complaints.summary.solved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Canceled</span>
              <span className="text-red-400 font-semibold">{dashboardData.complaints.summary.canceled}</span>
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
            {dashboardData.recent.complaints.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent complaints</p>
            ) : (
              dashboardData.recent.complaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{complaint.title}</p>
                    <p className="text-gray-400 text-sm">{complaint.student.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {dashboardData.recent.payments.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent payments</p>
            ) : (
              dashboardData.recent.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{payment.student.name}</p>
                    <p className="text-gray-400 text-sm">{formatCurrency(payment.paidRent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">{formatCurrency(payment.paidRent)}</p>
                    <p className="text-gray-400 text-xs">{formatDate(payment.paidDate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Statistics Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
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

      {/* Categories Overview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Categories Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.categories.map((category) => (
            <div key={category.id} className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-white font-medium">{category.title}</h4>
              <p className="text-green-400 font-semibold">{formatCurrency(category.rentAmount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
