import { clearAuthCookies } from '@/lib/auth';

export async function POST() {
  try {
    const cookies = clearAuthCookies();
    
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookies.join(', ')
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error logging out' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 