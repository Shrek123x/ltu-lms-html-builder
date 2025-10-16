/**
 * Next.js Middleware - Request Logging and Monitoring
 * 
 * This middleware runs on every request and provides:
 * - Request logging
 * - Performance metrics
 * - Custom headers
 * 
 * REQUIREMENT: Instrument this app (run tests again and observe instrumentation)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`📨 [${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`);

  // Clone the response
  const response = NextResponse.next();

  // Add custom headers for monitoring
  response.headers.set('x-request-id', crypto.randomUUID());
  response.headers.set('x-timestamp', new Date().toISOString());

  // Log response time
  const duration = Date.now() - startTime;
  console.log(`✅ [${new Date().toISOString()}] Response sent in ${duration}ms`);

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
