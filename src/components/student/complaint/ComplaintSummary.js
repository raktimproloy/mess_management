"use client";
import React from "react";

function ComplaintSummary({ summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="text-gray-300 text-xs mb-1">Total</div>
        <div className="text-white text-lg font-bold">{summary.totalComplaints}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="text-yellow-300 text-xs mb-1">Pending</div>
        <div className="text-yellow-400 text-lg font-bold">{summary.pendingComplaints}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="text-blue-300 text-xs mb-1">Checking</div>
        <div className="text-blue-400 text-lg font-bold">{summary.checkingComplaints}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="text-green-300 text-xs mb-1">Solved</div>
        <div className="text-green-400 text-lg font-bold">{summary.solvedComplaints}</div>
      </div>
    </div>
  );
}

export default ComplaintSummary;
