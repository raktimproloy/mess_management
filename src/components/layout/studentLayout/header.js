'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentData, logoutStudent } from '../../../lib/auth';

export default function StudentHeader() {
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
    <header className="flex items-center justify-between px-6 py-4 bg-[#18181b] border-b border-[#232329] text-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tight">Student Panel</span>
      </div>
      <div className="flex items-center gap-4">
        {studentData && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Welcome, {studentData.name}</span>
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-lg font-bold text-white">
              {studentData.name ? studentData.name.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
