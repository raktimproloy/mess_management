// This middleware is now a no-op because authentication is handled client-side with localStorage.
// You can safely delete this file if you do not need any other middleware logic.

export function middleware(request) {
  return;
}

export const config = {
  matcher: []
}; 