'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ className = "" }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to home page after logout
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
    >
      Logout
    </button>
  );
} 