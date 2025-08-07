'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentData, logoutStudent } from '../../../lib/auth';

export default function StudentHeader({ onMenuToggle }) {
  const [studentData, setStudentData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const student = getStudentData();
    setStudentData(student);
  }, []);

  const handleLogout = () => {
    logoutStudent();
    router.push('/login/student');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex flex-col justify-center items-center w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
          <div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
          <div className="w-6 h-0.5 bg-white transition-all duration-300"></div>
        </button>

        {/* Desktop Title */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">🏠</span>
          </div>
          <span className="text-xl font-bold text-white">Student Panel</span>
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-3">
          {studentData && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2 border border-white/20">
                <span className="text-sm font-medium text-white">
                  {studentData.name}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white/20">
                {studentData.name ? studentData.name.charAt(0).toUpperCase() : 'S'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 hover:bg-red-500/20 border border-white/20 transition-all duration-300 group"
            aria-label="Logout"
          >
            <svg 
              className="w-6 h-6 text-white group-hover:text-red-400 transition-all duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
