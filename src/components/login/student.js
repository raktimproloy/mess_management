'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminData, getStudentData } from "../../lib/auth";


export default function student() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
  
    useEffect(() => {
      // Check if user is already logged in and redirect
      const checkAuthAndRedirect = () => {
        const adminData = getAdminData();
        const studentData = getStudentData();
  
        if (adminData) {
          router.push('/admin/dashboard');
          return;
        }
        if (studentData) {
          router.push('/student/dashboard');
          return;
        }
      };
  
      checkAuthAndRedirect();
    }, []); // Remove router from dependencies to prevent infinite re-renders
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/student/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        });
        const data = await res.json();
        console.log('Student login response:', data);
        
        if (!res.ok) throw new Error(data.message || "Login failed");
        
        if (data.role === "student" && data.token) {
          // Set localStorage with both token and student data
          localStorage.setItem('studentToken', data.token);
          localStorage.setItem('studentData', JSON.stringify(data.student));
          
          console.log('Student token set in localStorage:', localStorage.getItem('studentToken'));
          console.log('Student data set in localStorage:', localStorage.getItem('studentData'));
          
          // Add a small delay to ensure localStorage is set before redirect
          setTimeout(() => {
            router.push("/student/dashboard");
          }, 100);
        } else {
          setError("Not a student account");
        }
      } catch (err) {
        setError(err.message);
        console.error('Student login error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👨‍🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Login</h1>
            <p className="text-gray-300 text-sm">Welcome back! Please sign in to your account.</p>
          </div>
  
          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <div className="flex items-center">
                  <span className="text-red-400 text-lg mr-2">⚠️</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}
  
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Input */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <span className="text-gray-400 text-lg">📱</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 relative z-20"
                    placeholder="Enter your phone number"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
  
              {/* Password Input */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <span className="text-gray-400 text-lg">🔒</span>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 relative z-20"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-30"
                  >
                    <span className="text-gray-400 text-lg">
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </button>
                </div>
              </div>
  
              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform  active:scale-95 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Sign In
                  </div>
                )}
              </button>
            </form>
  
            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs">
                Need help? Contact your administrator
              </p>
            </div>
          </div>
  
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div> */}
        </div>
      </div>
    );
}
