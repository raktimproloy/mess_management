"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getAdminData } from '../../../lib/auth';

export default function PaymentCronPage() {
  const [loading, setLoading] = useState(false);
  const [cronStatus, setCronStatus] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const adminData = getAdminData();
      if (!adminData) {
        router.push('/login/admin');
        return;
      }
      fetchCronStatus();
    };

    checkAuth();
  }, []);

  const fetchCronStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/payment-request/cron', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    }
  };

  const runCronJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/payment-request/cron', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Cron job completed successfully!');
        setLastRun({
          timestamp: new Date().toISOString(),
          summary: result.summary
        });
        fetchCronStatus(); // Refresh status
      } else {
        toast.error(result.error || 'Cron job failed');
      }
    } catch (error) {
      console.error('Error running cron job:', error);
      toast.error('Failed to run cron job');
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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Payment Cron Management</h1>
              <p className="text-gray-300 text-sm mt-1">Manage automatic payment processing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Control Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="text-2xl mr-3">⚙️</span>
            Cron Job Control
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">Manual Trigger</h3>
              <p className="text-gray-300 text-sm mb-4">
                Manually run the payment processing cron job to check for pending payments
              </p>
              <button
                onClick={runCronJob}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔄</span>
                    Run Cron Job
                  </>
                )}
              </button>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">Status Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Pending Requests:</span>
                  <span className="text-yellow-400 font-semibold">
                    {cronStatus?.pendingCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Rejected Requests:</span>
                  <span className="text-red-400 font-semibold">
                    {cronStatus?.rejectedCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Total Payments:</span>
                  <span className="text-blue-400 font-semibold">
                    {cronStatus?.totalPayments || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Last Checked:</span>
                  <span className="text-green-400 font-semibold text-xs">
                    {cronStatus?.lastChecked ? formatDate(cronStatus.lastChecked) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Run Results */}
          {lastRun && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-3">Last Run Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{lastRun.summary.totalProcessed}</div>
                  <div className="text-gray-300 text-sm">Total Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{lastRun.summary.successCount}</div>
                  <div className="text-gray-300 text-sm">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{lastRun.summary.rejectedCount || 0}</div>
                  <div className="text-gray-300 text-sm">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{lastRun.summary.errorCount}</div>
                  <div className="text-gray-300 text-sm">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {lastRun.summary.totalProcessed > 0 
                      ? Math.round((lastRun.summary.successCount / lastRun.summary.totalProcessed) * 100)
                      : 0}%
                  </div>
                  <div className="text-gray-300 text-sm">Success Rate</div>
                </div>
              </div>
              <div className="mt-4 text-gray-300 text-sm">
                Run at: {formatDate(lastRun.timestamp)}
              </div>
            </div>
          )}
        </div>

        {/* Recent Auto-Approved Payments */}
        {cronStatus?.recentAutoApproved && cronStatus.recentAutoApproved.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">✅</span>
              Recent Auto-Approved Payments
            </h2>
            
            <div className="space-y-3">
              {cronStatus.recentAutoApproved.map((request, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{request.student.name}</h3>
                      <p className="text-gray-300 text-sm truncate">{request.student.phone}</p>
                      <p className="text-blue-400 text-sm truncate">{request.category.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-green-400 font-semibold">{formatCurrency(request.totalAmount)}</p>
                      <p className="text-gray-300 text-xs">
                        {request.rentHistory?.paidDate ? formatDate(request.rentHistory.paidDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Statistics */}
        {cronStatus?.paymentStats && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Payment Statistics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-blue-400">{cronStatus.paymentStats.total}</div>
                <div className="text-gray-300 text-sm">Total Payments</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-yellow-400">{cronStatus.paymentStats.pending}</div>
                <div className="text-gray-300 text-sm">Pending</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-green-400">{cronStatus.paymentStats.approved}</div>
                <div className="text-gray-300 text-sm">Approved</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-red-400">{cronStatus.paymentStats.rejected}</div>
                <div className="text-gray-300 text-sm">Rejected</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Rejected Payments */}
        {cronStatus?.recentRejectedPayments && cronStatus.recentRejectedPayments.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">❌</span>
              Recent Rejected Payments
            </h2>
            
            <div className="space-y-3">
              {cronStatus.recentRejectedPayments.map((payment, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">TRX: {payment.trxid}</h3>
                      <p className="text-gray-300 text-sm truncate">Amount: ৳{payment.amount}</p>
                      <p className="text-red-400 text-sm truncate">From: {payment.fromDetails || 'N/A'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-red-400 font-semibold">Rejected</p>
                      <p className="text-gray-300 text-xs">
                        {formatDate(payment.receivedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SMS Information */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="text-2xl mr-3">📱</span>
            SMS Integration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">Welcome Messages</h3>
              <p className="text-gray-300 text-sm">
                New students receive a welcome SMS with their category and rent details when they are added to the system.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">Payment Confirmations</h3>
              <p className="text-gray-300 text-sm">
                Students receive payment confirmation SMS when their online payments are automatically approved by the cron job.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
