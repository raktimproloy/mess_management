'use client'
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdminData, getStudentData } from "../../../lib/auth";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already logged in and redirect to appropriate dashboard
    const checkAuthAndRedirect = () => {
      const adminData = getAdminData();
      const studentData = getStudentData();

      // Only redirect if we're on the main pages (not already on dashboard pages)
      const isOnMainPage = ['/', '/about', '/features', '/photos', '/contact'].includes(pathname);
      const isOnLoginPage = pathname.includes('/login');
      const isOnDashboardPage = pathname.includes('/dashboard');

      if (isOnMainPage && !isOnLoginPage && !isOnDashboardPage) {
        if (adminData) {
          router.push('/admin/dashboard');
          return;
        }
        if (studentData) {
          router.push('/student/dashboard');
          return;
        }
      }
    };

    checkAuthAndRedirect();
  }, [pathname]); // Only depend on pathname, not router

  return (
    <div className="min-h-screen bg-[#121214]">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 text-white overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
