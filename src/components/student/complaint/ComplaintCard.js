"use client";
import React from "react";

function ComplaintCard({ 
  complaint, 
  isExpanded, 
  onToggle, 
  onView, 
  onEdit, 
  onDelete, 
  onLoading 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'checking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'solved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
      {/* Header - Always visible */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">{complaint.title}</h3>
            <p className="text-gray-300 text-sm">{formatDate(complaint.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
              {complaint.status.toUpperCase()}
            </div>
            <button
              onClick={() => onToggle(complaint.id)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300"
            >
              <svg 
                className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Basic Info - Always visible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-gray-300 text-xs mb-1">Type</div>
            <div className="text-white text-sm font-medium">
              {complaint.complainFor === 'mess' ? '🍽️ Mess' : '🏠 Room'}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-gray-300 text-xs mb-1">Status</div>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
              {complaint.status}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-white/10">
          <div className="pt-4 space-y-4">
            {/* Complaint Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white mb-3">📋 Complaint Details</h4>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-gray-300 text-sm mb-2">Description:</div>
                <div className="text-white text-sm leading-relaxed">{complaint.details}</div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-white font-medium text-sm mb-3">📊 Request Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Request ID:</span>
                  <span className="text-white text-xs">{complaint.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Created:</span>
                  <span className="text-white">{formatDate(complaint.createdAt)}</span>
                </div>
                {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Last Updated:</span>
                    <span className="text-white">{formatDate(complaint.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => onView(complaint)}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                👁️ View
              </button>
              {complaint.status === 'pending' && (
                <>
                  <button
                    onClick={() => onEdit(complaint)}
                    disabled={onLoading}
                    className="flex-1 py-3 px-4 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30 font-medium hover:bg-yellow-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {onLoading && (
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(complaint.id)}
                    disabled={onLoading}
                    className="flex-1 py-3 px-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 font-medium hover:bg-red-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {onLoading && (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintCard;
