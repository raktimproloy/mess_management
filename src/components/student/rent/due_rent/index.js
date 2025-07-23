"use client";
import React, { useState, useMemo, useEffect } from "react";

const PAGE_SIZE = 5;

export default function DueRent() {
  const [rents, setRents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, type: null, rent: null, selected: [] });
  const [rentType, setRentType] = useState("");
  const [rentTypes, setRentTypes] = useState([]);

  useEffect(() => {
    import("./due_rents.json").then((mod) => setRents(mod.default || []));
  }, []);

  // Summary
  const current = rents[0] || {};
  const totalDue = rents.filter(r => !r.paid).reduce((sum, r) => sum + (r.totalDue || 0), 0);
  const lastPayment = useMemo(() => {
    const paid = rents.filter(r => r.lastPayment && r.lastPayment.amount > 0);
    if (!paid.length) return { date: "-", amount: 0 };
    return paid.sort((a, b) => new Date(b.lastPayment.date) - new Date(a.lastPayment.date))[0].lastPayment;
  }, [rents]);

  // Pagination
  const totalPages = Math.ceil(rents.length / PAGE_SIZE) || 1;
  const paginatedRents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rents.slice(start, start + PAGE_SIZE);
  }, [rents, page]);

  // Handlers
  const handleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selected.length === paginatedRents.filter(r => !r.paid).length) {
      setSelected([]);
    } else {
      setSelected(paginatedRents.filter(r => !r.paid).map(r => r.id));
    }
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };
  const openModal = (type, rent = null) => {
    setModal({ open: true, type, rent, selected: type === "selected" ? rents.filter(r => selected.includes(r.id)) : [] });
    setRentTypes([]);
  };
  const closeModal = () => {
    setModal({ open: false, type: null, rent: null, selected: [] });
    setRentTypes([]);
  };
  const handleFullPaid = () => {
    alert("Full paid confirmed!");
    closeModal();
  };
  const handleSelectedPaid = () => {
    alert(`Paid for selected months: ${modal.selected.map(r => r.monthYear).join(", ")}, Types: ${rentTypes.join(", ")}`);
    closeModal();
  };
  const handlePayNow = () => {
    alert(`Paid for ${modal.rent.monthYear}, Types: ${rentTypes.join(", ")}`);
    closeModal();
  };

  // Calculate total for selected types
  const getSelectedTotal = (records) => {
    if (!rentTypes.length) return 0;
    return records.reduce((sum, r) => {
      let subtotal = 0;
      if (rentTypes.includes("regular")) subtotal += r.dueRent || 0;
      if (rentTypes.includes("advance")) subtotal += r.advanceRent || 0;
      if (rentTypes.includes("external")) subtotal += r.externalRent || 0;
      return sum + subtotal;
    }, 0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-xl font-bold text-black">{current.monthYear || "-"}</div>
        <div className="flex gap-6 flex-wrap">
          <div className="text-black">Monthly Rent: <span className="font-bold">₹{current.monthlyRent || 0}</span></div>
          <div className="text-black">Total Due Rent: <span className="font-bold">₹{totalDue}</span></div>
          <div className="text-black">Last Payment: <span className="font-bold">₹{lastPayment.amount}</span> <span className="text-xs">({lastPayment.date})</span></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal("full")}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Full Paid
          </button>
          <button
            onClick={() => openModal("selected")}
            className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            disabled={selected.length === 0}
          >
            Selected Paid
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">
                <input
                  type="checkbox"
                  checked={selected.length === paginatedRents.filter(r => !r.paid).length && paginatedRents.filter(r => !r.paid).length > 0}
                  onChange={handleSelectAll}
                  className="accent-blue-600"
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Month/Year</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Due Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">External Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Advance Rent</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-black uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-black">No data found.</td>
              </tr>
            ) : (
              paginatedRents.map((rent) => (
                <tr key={rent.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={selected.includes(rent.id)}
                      onChange={() => handleSelect(rent.id)}
                      className="accent-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-black">{rent.monthYear}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.dueRent}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.externalRent}</td>
                  <td className="px-4 py-2 text-sm text-black">₹{rent.advanceRent}</td>
                  <td className="px-4 py-2 text-sm text-black">
                    <button
                      onClick={() => openModal("pay", rent)}
                      className="px-2 py-1 border border-black rounded hover:bg-blue-200 text-black transition"
                      disabled={rent.paid}
                    >
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-black">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Modals */}
      {/* Full Paid Confirmation */}
      {modal.open && modal.type === "full" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Confirm Full Paid</h2>
            <div className="mb-4 text-black text-center">
              Are you sure you want to pay all due rents? <br />
              <span className="font-bold">Total Due: ₹{totalDue}</span>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleFullPaid}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-md bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Selected Paid Modal */}
      {modal.open && modal.type === "selected" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Selected Paid</h2>
            <div className="mb-4 text-black">
              <div>Total Selected Months: <span className="font-bold">{modal.selected.length}</span></div>
              <div className="mt-2">Select Rent Types:</div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={rentTypes.includes("regular")} onChange={e => setRentTypes(rt => e.target.checked ? [...rt, "regular"] : rt.filter(t => t !== "regular"))} /> Regular
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={rentTypes.includes("advance")} onChange={e => setRentTypes(rt => e.target.checked ? [...rt, "advance"] : rt.filter(t => t !== "advance"))} /> Advance
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={rentTypes.includes("external")} onChange={e => setRentTypes(rt => e.target.checked ? [...rt, "external"] : rt.filter(t => t !== "external"))} /> External
                </label>
              </div>
              <div className="mt-4">Total Amount: <span className="font-bold">₹{getSelectedTotal(modal.selected)}</span></div>
            </div>
            <button
              onClick={handleSelectedPaid}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
              disabled={rentTypes.length === 0}
            >
              Pay
            </button>
          </div>
        </div>
      )}
      {/* Pay Now Modal */}
      {modal.open && modal.type === "pay" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black text-center">Pay Now</h2>
            <div className="mb-4 text-black">
              <div>Month/Year: <span className="font-bold">{modal.rent.monthYear}</span></div>
              <div>Due Rent: <span className="font-bold">₹{modal.rent.dueRent}</span></div>
              <div>External Rent: <span className="font-bold">₹{modal.rent.externalRent}</span></div>
              <div>Advance Rent: <span className="font-bold">₹{modal.rent.advanceRent}</span></div>
              <div>Total Due: <span className="font-bold">₹{modal.rent.totalDue}</span></div>
              <div className="mt-2">Select Rent Types:</div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={rentTypes.includes("regular")} onChange={e => setRentTypes(rt => e.target.checked ? [...rt, "regular"] : rt.filter(t => t !== "regular"))} /> Regular
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={rentTypes.includes("advance")} onChange={e => setRentTypes(rt => e.target.checked ? [...rt, "advance"] : rt.filter(t => t !== "advance"))} /> Advance
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={rentTypes.includes("external")} onChange={e => setRentTypes(rt => e.target.checked ? [...rt, "external"] : rt.filter(t => t !== "external"))} /> External
                </label>
              </div>
              <div className="mt-4">Total Amount: <span className="font-bold">₹{getSelectedTotal([modal.rent])}</span></div>
            </div>
            <button
              onClick={handlePayNow}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
              disabled={rentTypes.length === 0}
            >
              Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
