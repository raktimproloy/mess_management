'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isStudentAuthenticated } from '../lib/auth';

export default function StudentProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const authenticated = isStudentAuthenticated();
      console.log('StudentProtectedRoute: Authentication check:', authenticated ? 'authenticated' : 'not authenticated');
      
      if (authenticated) {
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login/student') {
          router.replace('/login/student');
        }
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'studentToken') {
        console.log('StudentProtectedRoute: Storage changed for studentToken');
        setTimeout(checkAuth, 100);
      }
    };
    
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#18181b]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
} 