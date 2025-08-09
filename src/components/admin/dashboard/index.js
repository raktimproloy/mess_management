"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getAdminData, getStudentData } from '../../../lib/auth';

export default function index() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const checkAuth = () => {
        const adminData = getAdminData();
        const studentData = getStudentData();
  
        if (studentData) {
          router.push('/student/dashboard');
          return;
        }
  
        if (!adminData) {
          router.push('/login/admin');
          return;
        }
  
        fetchDashboardData();
      };
  
      checkAuth();
    }, []);
  
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
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0);
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
        case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'checking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'solved': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    };
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-base sm:text-lg">Loading Dashboard...</p>
          </div>
        </div>
      );
    }
  
    if (!dashboardData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-red-400 text-4xl sm:text-6xl mb-4">⚠️</div>
            <p className="text-white text-base sm:text-lg">Failed to load dashboard data</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">🏢 Admin Dashboard</h1>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 line-clamp-2">Welcome back! Here's what's happening in your mess management system.</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 ml-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white text-base sm:text-lg font-bold">👨‍💼</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          {/* Main Statistics Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Total Students */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">👥</div>
                <div className="text-right min-w-0">
                  <p className="text-gray-300 text-xs truncate">Total Students</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{dashboardData.students.total}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-green-400 truncate">{dashboardData.students.living} Living</span>
                <span className="text-gray-400 truncate">{dashboardData.students.left} Left</span>
              </div>
            </div>
  
            {/* Current Month Collections */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">💰</div>
                <div className="text-right min-w-0">
                  <p className="text-gray-300 text-xs truncate">This Month</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-400">{formatCurrency(dashboardData.rents.currentMonthStats.totalPaid)}</p>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-blue-400 truncate">
                {dashboardData.rents.currentMonth} Students
              </div>
            </div>
  
            {/* Pending Complaints */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">📝</div>
                <div className="text-right min-w-0">
                  <p className="text-gray-300 text-xs truncate">Pending Complaints</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-400">{dashboardData.complaints.pending}</p>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-400 truncate">
                {dashboardData.complaints.total} Total
              </div>
            </div>
  
            {/* Payment Requests */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">💳</div>
                <div className="text-right min-w-0">
                  <p className="text-gray-300 text-xs truncate">Payment Requests</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-400">{dashboardData.payments.pendingRequests}</p>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-400 truncate">
                Pending
              </div>
            </div>
          </div>
  
          {/* Current Month Summary */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">📊</span>
              <span className="truncate">Current Month Summary</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-gray-300 text-sm mb-2">Expected Collection</p>
                <p className="text-blue-400 font-bold text-lg sm:text-xl">{formatCurrency(dashboardData.rents.currentMonthStats.totalRent)}</p>
              </div>
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-gray-300 text-sm mb-2">Actual Collection</p>
                <p className="text-green-400 font-bold text-lg sm:text-xl">{formatCurrency(dashboardData.rents.currentMonthStats.totalPaid)}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Collection Rate</span>
                <span className="text-yellow-400 font-semibold text-sm">
                  {dashboardData.rents.currentMonthStats.totalRent > 0 
                    ? Math.round((dashboardData.rents.currentMonthStats.totalPaid / dashboardData.rents.currentMonthStats.totalRent) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
  
          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Rent Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📊</span>
                <span className="truncate">Current Month Rent Statistics</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Paid Rents</span>
                  <span className="text-green-400 font-semibold text-sm truncate ml-2">
                    {dashboardData.rents.summary.paid.count} ({formatCurrency(dashboardData.rents.summary.paid.amount)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Unpaid Rents</span>
                  <span className="text-red-400 font-semibold text-sm truncate ml-2">
                    {dashboardData.rents.summary.unpaid.count} ({formatCurrency(dashboardData.rents.summary.unpaid.amount)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Partial Payments</span>
                  <span className="text-yellow-400 font-semibold text-sm truncate ml-2">
                    {dashboardData.rents.summary.partial.count} ({formatCurrency(dashboardData.rents.summary.partial.amount)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Total Collected</span>
                  <span className="text-blue-400 font-semibold text-sm truncate ml-2">
                    {formatCurrency(dashboardData.rents.currentMonthStats.totalPaid)}
                  </span>
                </div>
              </div>
            </div>
  
            {/* All-Time Rent Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📈</span>
                <span className="truncate">All-Time Rent Statistics</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Total Paid</span>
                  <span className="text-green-400 font-semibold text-sm truncate ml-2">
                    {dashboardData.rents.allTimeSummary.paid.count} ({formatCurrency(dashboardData.rents.allTimeSummary.paid.amount)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Total Unpaid</span>
                  <span className="text-red-400 font-semibold text-sm truncate ml-2">
                    {dashboardData.rents.allTimeSummary.unpaid.count} ({formatCurrency(dashboardData.rents.allTimeSummary.unpaid.amount)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Total Partial</span>
                  <span className="text-yellow-400 font-semibold text-sm truncate ml-2">
                    {dashboardData.rents.allTimeSummary.partial.count} ({formatCurrency(dashboardData.rents.allTimeSummary.partial.amount)})
                  </span>
                </div>
              </div>
            </div>
  
            {/* Complaint Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📝</span>
                <span className="truncate">Complaint Statistics</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Pending</span>
                  <span className="text-yellow-400 font-semibold text-sm">{dashboardData.complaints.summary.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Checking</span>
                  <span className="text-blue-400 font-semibold text-sm">{dashboardData.complaints.summary.checking}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Solved</span>
                  <span className="text-green-400 font-semibold text-sm">{dashboardData.complaints.summary.solved}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                  <span className="text-gray-300 text-sm truncate">Canceled</span>
                  <span className="text-red-400 font-semibold text-sm">{dashboardData.complaints.summary.canceled}</span>
                </div>
              </div>
            </div>
          </div>
  
          {/* Recent Activities */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Recent Complaints */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📝</span>
                <span className="truncate">Recent Complaints</span>
              </h3>
              <div className="space-y-3">
                {dashboardData.recent.complaints.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl mb-2">📭</div>
                    <p className="text-gray-300 text-sm">No recent complaints</p>
                  </div>
                ) : (
                  dashboardData.recent.complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{complaint.title}</p>
                          <p className="text-gray-300 text-xs sm:text-sm truncate">{complaint.student.name}</p>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
  
            {/* Recent Payments */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">💳</span>
                <span className="truncate">Recent Payments</span>
              </h3>
              <div className="space-y-3">
                {dashboardData.recent.payments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl mb-2">💳</div>
                    <p className="text-gray-300 text-sm">No recent payments</p>
                  </div>
                ) : (
                  dashboardData.recent.payments.map((payment) => (
                    <div key={payment.id} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{payment.student.name}</p>
                          <p className="text-gray-300 text-xs sm:text-sm truncate">{formatCurrency(payment.paidRent)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-green-400 font-medium text-sm sm:text-base">{formatCurrency(payment.paidRent)}</p>
                          <p className="text-gray-300 text-xs">{formatDate(payment.paidDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
  
          {/* Monthly Statistics Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">📈</span>
              <span className="truncate">Monthly Payment Statistics</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {dashboardData.monthlyStats.map((stat, index) => (
                <div key={index} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                  <p className="text-gray-300 text-xs sm:text-sm truncate">{stat.month}</p>
                  <p className="text-white font-semibold mt-1 text-sm sm:text-base truncate">{formatCurrency(stat.totalPaid)}</p>
                  <p className="text-gray-300 text-xs mt-1 truncate">{stat.paymentCount} payments</p>
                </div>
              ))}
            </div>
          </div>
  
          {/* Categories Overview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">🏷️</span>
              <span className="truncate">Categories Overview</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {dashboardData.categories.map((category) => (
                <div key={category.id} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                  <h4 className="text-white font-medium text-sm sm:text-base truncate">{category.title}</h4>
                  <p className="text-green-400 font-semibold text-sm sm:text-base truncate">{formatCurrency(category.rentAmount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}
