"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getStudentData } from "../../../../lib/auth";

const PAGE_SIZE = 5;

export default function DueRent() {
  const [currentRent, setCurrentRent] = useState(null);
  const [previousRents, setPreviousRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState({ open: false, type: null, rent: null });
  const [paymentForm, setPaymentForm] = useState({
    rentAmount: 0,
    advanceAmount: 0,
    externalAmount: 0,
    previousDueAmount: 0,
    paymentMethod: "on hand",
    bikashNumber: "",
    trxId: ""
  });
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [currentMonthHistory, setCurrentMonthHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState('current');

  const studentData = getStudentData();

  // Fetch payment requests for the student
  useEffect(() => {
    async function fetchPaymentRequests() {
      try {
        const token = localStorage.getItem('studentToken');
        const response = await fetch('/api/payment-request', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch payment requests');
        const data = await response.json();
        setPaymentRequests(data.requests || []);
      } catch (error) {
        setPaymentRequests([]);
      }
    }
    fetchPaymentRequests();
  }, [currentRent, previousRents]);

  // Fetch current month's rent history for the student
  useEffect(() => {
    async function fetchCurrentMonthHistory() {
      try {
        const token = localStorage.getItem('studentToken');
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const response = await fetch(`/api/student/rent-history?month=${month}&year=${year}&pageSize=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch rent history');
        const data = await response.json();
        setCurrentMonthHistory(data.history || []);
      } catch (error) {
        setCurrentMonthHistory([]);
      }
    }
    fetchCurrentMonthHistory();
  }, []);

  // Helper to get pending request for a rent
  const getPendingRequestForRent = (rentId) => {
    return paymentRequests.find(r => r.rentId === rentId && r.status === 'pending');
  };

  // Add helper to get all payment requests for a rent
  const getRequestsForRent = (rentId) => {
    return paymentRequests.filter(r => r.rentId === rentId);
  };

  useEffect(() => {
    fetchRentData();
  }, [page]);

  const fetchRentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch(`/api/student/current-rent?page=${page}&limit=${PAGE_SIZE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rent data');
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentRent(data.currentRent);
        setPreviousRents(data.previousRents);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.error || 'Failed to fetch rent data');
      }
    } catch (error) {
      console.error('Error fetching rent data:', error);
      toast.error('Failed to load rent data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openModal = (type, rent = null) => {
    setModal({ open: true, type, rent });
    if (rent) {
      const remainingRent = (rent.rentAmount || 0) - (rent.rentPaid || 0);
      const remainingAdvance = (rent.advanceAmount || 0) - (rent.advancePaid || 0);
      const remainingExternal = (rent.externalAmount || 0) - (rent.externalPaid || 0);
      const remainingPreviousDue = (rent.previousDue || 0) - (rent.previousDuePaid || 0);
      setPaymentForm({
        rentAmount: remainingRent > 0 ? remainingRent : 0,
        advanceAmount: remainingAdvance > 0 ? remainingAdvance : 0,
        externalAmount: remainingExternal > 0 ? remainingExternal : 0,
        previousDueAmount: remainingPreviousDue > 0 ? remainingPreviousDue : 0,
        paymentMethod: "on hand",
        bikashNumber: "",
        trxId: ""
      });
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: null, rent: null });
    setPaymentForm({
      rentAmount: 0,
      advanceAmount: 0,
      externalAmount: 0,
      previousDueAmount: 0,
      paymentMethod: "on hand",
      bikashNumber: "",
      trxId: ""
    });
  };

  const handlePaymentRequest = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const totalAmount = paymentForm.rentAmount + paymentForm.advanceAmount + 
                         paymentForm.externalAmount + paymentForm.previousDueAmount;

      const requestData = {
        rentId: modal.rent.id,
        paymentMethod: paymentForm.paymentMethod,
        bikashNumber: paymentForm.paymentMethod === "online" ? paymentForm.bikashNumber : null,
        trxId: paymentForm.paymentMethod === "online" ? paymentForm.trxId : null,
        totalAmount: totalAmount,
        rentAmount: paymentForm.rentAmount,
        advanceAmount: paymentForm.advanceAmount,
        externalAmount: paymentForm.externalAmount,
        previousDueAmount: paymentForm.previousDueAmount
      };

      const response = await fetch('/api/payment-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to create payment request');
      }

      toast.success('Payment request created successfully!');
      closeModal();
      fetchRentData();
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unpaid': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your rent information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">💰 Rent Management</h1>
        <p className="text-gray-300 text-sm">Track your rent payments and requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-1 mb-6 border border-white/20">
        <div className="flex">
          <button
            onClick={() => setSelectedTab('current')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedTab === 'current'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📅 Current Month
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedTab === 'history'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📚 Payment History
          </button>
        </div>
      </div>

      {/* Current Month Tab */}
      {selectedTab === 'current' && (
        <div className="space-y-6">
          {/* Current Month Summary Card */}
          {currentRent ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {formatDate(currentRent.createdAt)}
                  </h2>
                  <p className="text-gray-300 text-sm">Current Month Rent</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(currentRent.status)}`}>
                  {currentRent.status.toUpperCase()}
                </div>
              </div>

              {/* Amount Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-500/20 rounded-2xl p-4 border border-red-500/30">
                  <div className="text-red-300 text-sm mb-1">Total Due</div>
                  <div className="text-white text-xl font-bold">{formatCurrency(currentRent.totalDue)}</div>
                </div>
                <div className="bg-green-500/20 rounded-2xl p-4 border border-green-500/30">
                  <div className="text-green-300 text-sm mb-1">Total Paid</div>
                  <div className="text-white text-xl font-bold">
                    {formatCurrency((currentRent.rentPaid || 0) + (currentRent.advancePaid || 0) + (currentRent.externalPaid || 0) + (currentRent.previousDuePaid || 0))}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">Rent Amount</span>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(currentRent.rentAmount)}</div>
                    <div className="text-green-400 text-sm">Paid: {formatCurrency(currentRent.rentPaid)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">Advance</span>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(currentRent.advanceAmount)}</div>
                    <div className="text-green-400 text-sm">Paid: {formatCurrency(currentRent.advancePaid)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">External</span>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(currentRent.externalAmount)}</div>
                    <div className="text-green-400 text-sm">Paid: {formatCurrency(currentRent.externalPaid)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300">Previous Due</span>
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrency(currentRent.previousDue)}</div>
                    <div className="text-green-400 text-sm">Paid: {formatCurrency(currentRent.previousDuePaid)}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {currentRent.status !== 'paid' && (
                <div className="flex gap-3">
                  {getPendingRequestForRent(currentRent.id) ? (
                    <>
                      <button className="flex-1 py-3 px-4 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30 font-medium" disabled>
                        ⏳ Pending Request
                      </button>
                      <button
                        className="py-3 px-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 font-medium"
                        onClick={async () => {
                          const token = localStorage.getItem('studentToken');
                          const req = getPendingRequestForRent(currentRent.id);
                          if (!req) return;
                          const res = await fetch(`/api/payment-request?id=${req.id}`, { 
                            method: 'DELETE', 
                            headers: { 'Authorization': `Bearer ${token}` } 
                          });
                          if (res.ok) {
                            toast.success('Request cancelled');
                            fetchRentData();
                          } else {
                            toast.error('Failed to cancel request');
                          }
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openModal("payment", currentRent)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                    >
                      💳 Request Payment
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-white mb-2">No Current Rent</h3>
              <p className="text-gray-300">No rent data available for the current month</p>
            </div>
          )}

          {/* Current Month Payment History */}
          {currentMonthHistory.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">📊 This Month's Payments</h3>
              <div className="space-y-3">
                {currentMonthHistory.map((h) => (
                  <div key={h.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white font-medium">
                        {new Date(h.paidDate).toLocaleDateString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        h.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                        h.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {h.status}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-gray-300">Rent</div>
                        <div className="text-white font-medium">{formatCurrency(h.paidRent)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-300">Advance</div>
                        <div className="text-white font-medium">{formatCurrency(h.paidAdvance)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-300">External</div>
                        <div className="text-white font-medium">{formatCurrency(h.paidExternal)}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-gray-300 text-xs">Payment Type: {h.paymentType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Requests */}
          {currentRent && getRequestsForRent(currentRent.id).length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">📝 Payment Requests</h3>
              <div className="space-y-3">
                {getRequestsForRent(currentRent.id).map(req => (
                  <div key={req.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white font-medium">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                        req.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                        req.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {req.status}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Amount:</span>
                        <span className="text-white font-medium">{formatCurrency(req.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Method:</span>
                        <span className="text-white">{req.paymentMethod}</span>
                      </div>
                      {req.trxId && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">TRX ID:</span>
                          <span className="text-white text-xs">{req.trxId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
        {selectedTab === 'history' && <RentHistory />}

      {/* Payment Request Modal */}
      {modal.open && modal.type === "payment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-md p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">💳 Payment Request</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-gray-300 text-sm mb-1">Month</div>
                <div className="text-white font-medium">{formatDate(modal.rent.createdAt)}</div>
                <div className="text-gray-300 text-sm mt-1">Total Due: {formatCurrency(modal.rent.totalDue)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rent Amount</label>
                  <input
                    type="number"
                    value={paymentForm.rentAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, rentAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    max={modal.rent.rentAmount || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Advance Amount</label>
                  <input
                    type="number"
                    value={paymentForm.advanceAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, advanceAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    max={modal.rent.advanceAmount || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">External Amount</label>
                  <input
                    type="number"
                    value={paymentForm.externalAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, externalAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    max={modal.rent.externalAmount || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Previous Due</label>
                  <input
                    type="number"
                    value={paymentForm.previousDueAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, previousDueAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    max={modal.rent.previousDue || 0}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="on hand">💵 On Hand</option>
                  <option value="online">💳 Online</option>
                </select>
              </div>
              
              {paymentForm.paymentMethod === "online" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bikash Number</label>
                    <input
                      type="text"
                      value={paymentForm.bikashNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, bikashNumber: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter Bikash number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID</label>
                    <input
                      type="text"
                      value={paymentForm.trxId}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, trxId: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-500/30">
                <div className="text-center">
                  <div className="text-gray-300 text-sm">Total Amount</div>
                  <div className="text-white text-2xl font-bold">
                    {formatCurrency(paymentForm.rentAmount + paymentForm.advanceAmount + paymentForm.externalAmount + paymentForm.previousDueAmount)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePaymentRequest}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                ✅ Submit Request
              </button>
              <button
                onClick={closeModal}
                className="py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
