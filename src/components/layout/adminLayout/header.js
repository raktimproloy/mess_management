'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminData, logoutAdmin } from "../../../lib/auth";

export default function AdminHeader({ onMenuToggle }) {
  const [adminData, setAdminData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const admin = getAdminData();
    setAdminData(admin);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/login/admin');
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-[#232329] text-gray-800 dark:text-white shadow-sm">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232329] transition-colors"
        aria-label="Toggle menu"
      >
        <div className="w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1 transition-all duration-200"></div>
        <div className="w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1 transition-all duration-200"></div>
        <div className="w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-200"></div>
      </button>

      {/* Desktop Title */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">Admin Panel</span>
      </div>

      {/* User Info and Logout */}
      <div className="flex items-center gap-3">
        {adminData && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {adminData.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#232329] hover:bg-gray-200 dark:hover:bg-[#2a2a2d] transition-colors group"
          aria-label="Logout"
        >
          <svg 
            className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" 
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
    </header>
  );
}
