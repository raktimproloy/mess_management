"use client";
import React, { useState, useEffect } from "react";

function ComplaintModal({ open, onClose, onSave, complaint, mode, loading }) {
  const [form, setForm] = useState({
    title: '',
    details: '',
    complainFor: 'mess' // Default value
  });

  useEffect(() => {
    if (complaint) {
      setForm({
        title: complaint.title || '',
        details: complaint.details || '',
        complainFor: complaint.complainFor || 'mess'
      });
    } else {
      setForm({
        title: '',
        details: '',
        complainFor: 'mess'
      });
    }
  }, [complaint, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
          <h2 className="text-xl font-bold text-white mb-6">
            {mode === 'add' ? '📝 Create New Complaint' : mode === 'edit' ? '✏️ Edit Complaint' : '👁️ Complaint Details'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Complaint Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={mode === 'view' || loading}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300 hover:bg-white/15"
                placeholder="Enter complaint title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                disabled={mode === 'view' || loading}
                rows="4"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed resize-none transition-all duration-300 hover:bg-white/15"
                placeholder="Describe your complaint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Complain For</label>
              <select
                name="complainFor"
                value={form.complainFor}
                onChange={handleChange}
                disabled={mode === 'view' || loading || mode === 'edit'}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300 hover:bg-white/15"
              >
                <option value="mess">🍽️ Mess</option>
                <option value="room">🏠 Room</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                ❌ Cancel
              </button>
              {mode !== 'view' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {loading ? 'Saving...' : '💾 Save'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ComplaintModal;
