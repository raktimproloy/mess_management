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
  
        console.log('Student Dashboard - Auth Check:');
        console.log('Admin data:', adminData);
        console.log('Student data:', studentData);
  
        if (adminData) {
          console.log('Admin logged in, redirecting to admin dashboard');
          router.push('/admin/dashboard');
          return;
        }
  
        if (!studentData) {
          console.log('No student logged in, redirecting to login');
          router.push('/login/student');
          return;
        }
  
        console.log('Student logged in, fetching dashboard data');
        fetchDashboardData();
      };
  
      checkAuth();
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
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0);
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
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading Dashboard...</p>
          </div>
        </div>
      );
    }
  
    if (!dashboardData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg">Failed to load dashboard data</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">🏠 Dashboard</h1>
                <p className="text-gray-300 text-sm">Welcome back, {dashboardData.student.name}!</p>
              </div>
              <div className="flex items-center space-x-3">
                {dashboardData.student.profileImage ? (
                  <img 
                    src={dashboardData.student.profileImage} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-semibold">
                      {dashboardData.student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  
        <div className="p-4 space-y-6">
          {/* Student Info Card */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{dashboardData.student.name}</h2>
                <p className="text-gray-300 text-sm">📱 {dashboardData.student.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-xs">Category</p>
                <p className="font-semibold text-white">{dashboardData.category.title}</p>
                <p className="text-gray-300 text-sm">{formatCurrency(dashboardData.category.rentAmount)}/month</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Living for {dashboardData.student.livingMonths} months</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                {dashboardData.student.status}
              </span>
            </div>
          </div>
  
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Month Rent */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">💰</div>
                <div className="text-right">
                  <p className="text-gray-300 text-xs">Due Amount</p>
                  <p className="text-xl font-bold text-white">
                    {dashboardData.currentRent ? formatCurrency(dashboardData.currentRent.remainingDue) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
  
            {/* Total Paid */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">✅</div>
                <div className="text-right">
                  <p className="text-gray-300 text-xs">Total Paid</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(dashboardData.rentHistory.totalPaid)}
                  </p>
                </div>
              </div>
            </div>
  
            {/* Complaints */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">📝</div>
                <div className="text-right">
                  <p className="text-gray-300 text-xs">Complaints</p>
                  <p className="text-xl font-bold text-yellow-400">{dashboardData.complaints.total}</p>
                </div>
              </div>
            </div>
  
            {/* Payment Requests */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">💳</div>
                <div className="text-right">
                  <p className="text-gray-300 text-xs">Requests</p>
                  <p className="text-xl font-bold text-purple-400">{dashboardData.payments.totalRequests}</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Current Month Details */}
          {dashboardData.currentRent && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                Current Month Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-gray-300 text-xs">Rent Amount</p>
                  <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.rentAmount)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-gray-300 text-xs">Advance</p>
                  <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.advanceAmount)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-gray-300 text-xs">External</p>
                  <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.externalAmount)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-gray-300 text-xs">Previous Due</p>
                  <p className="text-white font-semibold">{formatCurrency(dashboardData.currentRent.previousDue)}</p>
                </div>
                {dashboardData.currentRent.discountAmount > 0 && (
                  <div className="bg-green-500/20 rounded-2xl p-3 col-span-2 border border-green-500/30">
                    <p className="text-green-400 text-xs">🎫 Discount</p>
                    <p className="text-green-300 font-semibold">-{formatCurrency(dashboardData.currentRent.discountAmount)}</p>
                  </div>
                )}
                <div className="bg-red-500/20 rounded-2xl p-3 border border-red-500/30">
                  <p className="text-red-400 text-xs">Total Due</p>
                  <p className="text-red-300 font-semibold">{formatCurrency(dashboardData.currentRent.totalDue)}</p>
                </div>
                <div className="bg-blue-500/20 rounded-2xl p-3 border border-blue-500/30">
                  <p className="text-blue-400 text-xs">Paid Amount</p>
                  <p className="text-blue-300 font-semibold">{formatCurrency(dashboardData.currentRent.paidAmount)}</p>
                </div>
              </div>
            </div>
          )}
  
          {/* Discount Information */}
          {dashboardData.discount && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-3xl p-6 border border-green-500/30 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">🎫</span>
                Discount Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Title</span>
                  <span className="font-semibold text-white">{dashboardData.discount.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Type</span>
                  <span className="font-semibold text-white capitalize">{dashboardData.discount.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Amount</span>
                  <span className="font-semibold text-white">
                    {dashboardData.discount.type === 'percent' ? `${dashboardData.discount.amount}%` : formatCurrency(dashboardData.discount.amount)}
                  </span>
                </div>
              </div>
            </div>
          )}
  
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Rent Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Rent Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{dashboardData.rents.total}</p>
                  <p className="text-gray-300 text-xs">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{dashboardData.rents.paid}</p>
                  <p className="text-gray-300 text-xs">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{dashboardData.rents.unpaid}</p>
                  <p className="text-gray-300 text-xs">Unpaid</p>
                </div>
              </div>
            </div>
  
            {/* Complaint Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Complaint Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{dashboardData.complaints.total}</p>
                  <p className="text-gray-300 text-xs">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{dashboardData.complaints.pending}</p>
                  <p className="text-gray-300 text-xs">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{dashboardData.complaints.checking}</p>
                  <p className="text-gray-300 text-xs">Checking</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{dashboardData.complaints.solved}</p>
                  <p className="text-gray-300 text-xs">Solved</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Recent Activities */}
          <div className="space-y-4">
            {/* Recent Complaints */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Recent Complaints
              </h3>
              <div className="space-y-3">
                {dashboardData.complaints.recent.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-gray-300">No recent complaints</p>
                  </div>
                ) : (
                  dashboardData.complaints.recent.map((complaint) => (
                    <div key={complaint.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">{complaint.title}</p>
                          <p className="text-gray-300 text-sm">{complaint.complainFor}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
  
            {/* Recent Payment Requests */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">💳</span>
                Recent Payment Requests
              </h3>
              <div className="space-y-3">
                {dashboardData.payments.recent.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">💳</div>
                    <p className="text-gray-300">No recent payment requests</p>
                  </div>
                ) : (
                  dashboardData.payments.recent.map((request) => (
                    <div key={request.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">{formatCurrency(request.totalAmount)}</p>
                          <p className="text-gray-300 text-sm">{request.paymentMethod}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
  
          {/* Monthly Statistics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Monthly Payment Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dashboardData.monthlyStats.map((stat, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                  <p className="text-gray-300 text-xs mb-1">{stat.month}</p>
                  <p className="text-white font-semibold text-sm">{formatCurrency(stat.totalPaid)}</p>
                  <p className="text-gray-300 text-xs">{stat.paymentCount} payments</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}
