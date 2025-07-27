"use client";
import React, { useState, useMemo, useEffect } from "react";
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

  const studentData = getStudentData();

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
      setPaymentForm({
        rentAmount: rent.rentAmount || 0,
        advanceAmount: rent.advanceAmount || 0,
        externalAmount: rent.externalAmount || 0,
        previousDueAmount: rent.previousDue || 0,
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
      fetchRentData(); // Refresh data
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'unpaid': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Current Month Summary */}
      {currentRent ? (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xl font-bold text-white">
              Current Month: {formatDate(currentRent.createdAt)}
            </div>
            <div className="flex gap-6 flex-wrap text-gray-300">
              <div>Rent: <span className="font-bold text-white">₹{currentRent.rentAmount || 0}</span></div>
              <div>Advance: <span className="font-bold text-white">₹{currentRent.advanceAmount || 0}</span></div>
              <div>External: <span className="font-bold text-white">₹{currentRent.externalAmount || 0}</span></div>
              <div>Previous Due: <span className="font-bold text-white">₹{currentRent.previousDue || 0}</span></div>
              <div>Total Due: <span className="font-bold text-white">₹{currentRent.totalDue || 0}</span></div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentRent.status)}`}>
                {currentRent.status}
              </span>
              {currentRent.status !== 'paid' && (
                <button
                  onClick={() => openModal("payment", currentRent)}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Request Payment
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <div className="text-center text-gray-400">
            <div className="text-xl font-bold text-white mb-2">Current Month</div>
            <div>No rent data available for current month</div>
          </div>
        </div>
      )}

      {/* Previous Months Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Previous Months</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Month/Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Rent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Advance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">External</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Previous Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Total Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {previousRents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">No previous rent data found.</td>
                </tr>
              ) : (
                previousRents.map((rent) => (
                  <tr key={rent.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{formatDate(rent.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-white">₹{rent.rentAmount || 0}</td>
                    <td className="px-4 py-3 text-sm text-white">₹{rent.advanceAmount || 0}</td>
                    <td className="px-4 py-3 text-sm text-white">₹{rent.externalAmount || 0}</td>
                    <td className="px-4 py-3 text-sm text-white">₹{rent.previousDue || 0}</td>
                    <td className="px-4 py-3 text-sm text-white">₹{rent.totalDue || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rent.status)}`}>
                        {rent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {rent.status !== 'paid' && (
                        <button
                          onClick={() => openModal("payment", rent)}
                          className="px-3 py-1 border border-blue-500 rounded hover:bg-blue-600 text-blue-500 hover:text-white transition"
                        >
                          Request Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {modal.open && modal.type === "payment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-gray-700">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 text-xl font-bold hover:text-white"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white text-center">Payment Request</h2>
            <div className="mb-4 text-gray-300">
              <div className="mb-4">
                <div>Month: <span className="font-bold text-white">{formatDate(modal.rent.createdAt)}</span></div>
                <div>Total Due: <span className="font-bold text-white">₹{modal.rent.totalDue || 0}</span></div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rent Amount</label>
                  <input
                    type="number"
                    value={paymentForm.rentAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, rentAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={modal.rent.rentAmount || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Advance Amount</label>
                  <input
                    type="number"
                    value={paymentForm.advanceAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, advanceAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={modal.rent.advanceAmount || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">External Amount</label>
                  <input
                    type="number"
                    value={paymentForm.externalAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, externalAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={modal.rent.externalAmount || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Previous Due Amount</label>
                  <input
                    type="number"
                    value={paymentForm.previousDueAmount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, previousDueAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={modal.rent.previousDue || 0}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="on hand">On Hand</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                
                {paymentForm.paymentMethod === "online" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Bikash Number</label>
                      <input
                        type="text"
                        value={paymentForm.bikashNumber}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, bikashNumber: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Bikash number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Transaction ID</label>
                      <input
                        type="text"
                        value={paymentForm.trxId}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, trxId: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter transaction ID"
                      />
                    </div>
                  </>
                )}
                
                <div className="mt-4 p-3 bg-gray-700 rounded-md">
                  <div className="text-sm text-gray-300">Total Amount: <span className="font-bold text-white">₹{paymentForm.rentAmount + paymentForm.advanceAmount + paymentForm.externalAmount + paymentForm.previousDueAmount}</span></div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePaymentRequest}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Submit Request
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
