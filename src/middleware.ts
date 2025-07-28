import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  // withAuth augments your `Request` with the user's token.
  async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;
    
    // Enhanced logging for debugging (remove in production)
    console.log(`Middleware: ${pathname}, Token exists: ${!!token}`);
    
    // Special handling for API routes that require authentication
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    // Redirect authenticated users away from login page
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Check for session expiration
    if (token && token.exp && typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
      // Token has expired, redirect to login
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user is authenticated, continue to the requested page
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Get the pathname of the request
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes without authentication
        const publicRoutes = ['/login', '/register', '/api/auth'];
        
        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        );
        
        // If it's a public route, allow access
        if (isPublicRoute) {
          return true;
        }
        
        // For protected routes, check if user has a valid token
        return !!token;
      },
    },
    pages: {
      signIn: '/login', // Redirect to your login page
      error: '/login', // Redirect to login on auth errors
    },
  }
);

export const config = {
  matcher: [
    /*
      Apply middleware to all routes except:
      - /api/auth/* (NextAuth.js routes)
      - /_next/static (static files)
      - /_next/image (image optimization files)
      - /favicon.ico (favicon file)
      - Public assets in /public folder
      - Static assets
    */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|.*\\..*|$).*)",
    "/api/((?!auth).*)"
  ],
};