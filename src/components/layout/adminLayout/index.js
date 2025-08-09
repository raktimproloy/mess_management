'use client';
import React, { useState } from "react";
import AdminHeader from "./header";
import AdminSidebar from "./sidebar";
import AdminBottomNav from "./bottomNav";

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-64">
          <AdminHeader />
          <main className="flex-1 p-0 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex flex-col min-h-screen relative">
        <AdminHeader onMenuToggle={toggleMobileMenu} />
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={toggleMobileMenu}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
            <h1 className="text-lg font-bold text-white">Menu</h1>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <AdminSidebar onLinkClick={toggleMobileMenu} />
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-0 md:p-4 overflow-y-auto pb-32">
          {children}
        </main>
        <AdminBottomNav />
      </div>
    </div>
  );
}
