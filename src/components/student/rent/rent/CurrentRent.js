'use client'
import React, { useState } from 'react'

export default function CurrentRent({ 
  currentRent, 
  currentMonthHistory, 
  paymentRequests,
  formatDate,
  formatCurrency,
  getStatusColor,
  getPendingRequestForRent,
  getRequestsForRent,
  openModal,
  fetchRentData
}) {
  const [isPaymentHistoryExpanded, setIsPaymentHistoryExpanded] = useState(false);

  return (
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
                        // You can import toast here if needed
                        fetchRentData();
                      } else {
                        // You can import toast here if needed
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

      {/* Current Month Payment History - Expandable */}
      {currentMonthHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <button
            onClick={() => setIsPaymentHistoryExpanded(!isPaymentHistoryExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">📊 This Month's Payments</h3>
              <span className="text-gray-400 text-sm">({currentMonthHistory.length} payments)</span>
            </div>
            <div className={`transform transition-transform duration-300 ${isPaymentHistoryExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {isPaymentHistoryExpanded && (
            <div className="px-6 pb-6 border-t border-white/10">
              <div className="space-y-3 pt-4">
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
  )
}
