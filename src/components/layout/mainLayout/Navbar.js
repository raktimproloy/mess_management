'use client'
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAdminData, getStudentData, logoutAdmin, logoutStudent } from "../../../lib/auth";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Check for admin first
    const adminData = getAdminData();
    if (adminData) {
      setUser({ ...adminData, role: 'admin' });
      setLoading(false);
      return;
    }

    // Check for student
    const studentData = getStudentData();
    if (studentData) {
      setUser({ ...studentData, role: 'student' });
      setLoading(false);
      return;
    }

    // No user logged in
    setUser(null);
    setLoading(false);
  };

  const handleLogout = () => {
    if (user?.role === 'admin') {
      logoutAdmin();
    } else if (user?.role === 'student') {
      logoutStudent();
    }
    setUser(null);
    router.push('/');
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (user?.role === 'student') {
      router.push('/student/dashboard');
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    // { name: "Features", href: "/features" },
    { name: "Photos", href: "/photos" },
    { name: "Contact", href: "/contact" },
  ];

  if (loading) {
    return (
      <nav className="bg-gray-900 border-b border-gray-700 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Avilash Palace
              </Link>
            </div>
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-700 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl">
              Avilash Palace
            </Link>
          </div>

          {/* Middle - Nav items (hidden on mobile) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Auth buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-300 px-3 py-2 text-sm">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleDashboardClick}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      user.role === 'admin' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login/student" 
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Student Login
                  </Link>
                  <Link 
                    href="/login/admin" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (dropdown) */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-700">
              {user ? (
                <>
                  <div className="px-3 py-2 text-gray-300 text-sm">
                    Welcome, {user.name}
                  </div>
                  <button
                    onClick={() => {
                      handleDashboardClick();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                      user.role === 'admin' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login/student"
                    className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Student Login
                  </Link>
                  <Link
                    href="/login/admin"
                    className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;