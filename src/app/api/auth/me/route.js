import { getUserFromCookies } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    
    if (!user) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 