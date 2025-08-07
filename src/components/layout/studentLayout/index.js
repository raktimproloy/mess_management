'use client';
import React, { useState } from "react";
import StudentHeader from "./header";
import StudentSidebar from "./sidebar";
import StudentBottomNav from "./bottomNav";

export default function StudentLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#121214]">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <StudentSidebar />
        <div className="flex-1 flex flex-col ml-64">
          <StudentHeader />
          <main className="flex-1 p-8 bg-[#18181b] text-white overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col min-h-screen relative">
        <StudentHeader onMenuToggle={toggleMobileMenu} />
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileMenu}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#18181b] border-r border-gray-200 dark:border-[#232329] z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#232329]">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h1>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232329] transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <StudentSidebar onLinkClick={toggleMobileMenu} />
          </div>
        </div>
        
        <main className="flex-1 p-4 bg-[#18181b] text-white overflow-y-auto pb-24">
          {children}
        </main>
        <StudentBottomNav />
      </div>
    </div>
  );
}
