'use client'
import React from 'react'

export default function RentHistory() {
  return (
    <div className="space-y-6">
          {previousRents.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-2">No History</h3>
              <p className="text-gray-300">No previous rent records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {previousRents.map((rent) => (
                <div key={rent.id} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{formatDate(rent.createdAt)}</h3>
                      <p className="text-gray-300 text-sm">Previous Month</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(rent.status)}`}>
                      {rent.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-500/20 rounded-2xl p-3 border border-red-500/30">
                      <div className="text-red-300 text-xs mb-1">Total Due</div>
                      <div className="text-white font-bold">{formatCurrency(rent.totalDue)}</div>
                    </div>
                    <div className="bg-green-500/20 rounded-2xl p-3 border border-green-500/30">
                      <div className="text-green-300 text-xs mb-1">Total Paid</div>
                      <div className="text-white font-bold">
                        {formatCurrency((rent.rentPaid || 0) + (rent.advancePaid || 0) + (rent.externalPaid || 0) + (rent.previousDuePaid || 0))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Rent: {formatCurrency(rent.rentAmount)}</span>
                      <span className="text-green-400">Paid: {formatCurrency(rent.rentPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Advance: {formatCurrency(rent.advanceAmount)}</span>
                      <span className="text-green-400">Paid: {formatCurrency(rent.advancePaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">External: {formatCurrency(rent.externalAmount)}</span>
                      <span className="text-green-400">Paid: {formatCurrency(rent.externalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Previous Due: {formatCurrency(rent.previousDue)}</span>
                      <span className="text-green-400">Paid: {formatCurrency(rent.previousDuePaid)}</span>
                    </div>
                  </div>

                  {/* Payment Date */}
                  {rent.paidDate && (
                    <div className="text-center py-2 bg-white/5 rounded-xl">
                      <div className="text-gray-300 text-xs">Paid Date</div>
                      <div className="text-white font-medium">{new Date(rent.paidDate).toLocaleDateString()}</div>
                    </div>
                  )}

                  {/* Payment Requests for this month */}
                  {getRequestsForRent(rent.id).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-2">📝 Payment Requests</h4>
                      <div className="space-y-2">
                        {getRequestsForRent(rent.id).map(req => (
                          <div key={req.id} className="bg-white/5 rounded-xl p-3 text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-300">{new Date(req.createdAt).toLocaleDateString()}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                                req.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                                req.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">{req.paymentMethod}</span>
                              <span className="text-white">{formatCurrency(req.totalAmount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-300">Page {page} of {totalPages}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                          page === pageNum 
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
  )
}
