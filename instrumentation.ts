/**
 * Next.js Instrumentation Hook
 * 
 * This file is automatically called by Next.js on server startup.
 * Use it for:
 * - Setting up monitoring and observability
 * - Initializing logging
 * - Performance tracking
 * - Error tracking
 * 
 * REQUIREMENT: Instrument this app (run tests again and observe instrumentation)
 */

export async function register() {
  console.log('🚀 Application instrumentation initialized');
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('⏰ Started at:', new Date().toISOString());

  // Log database connection
  console.log('💾 Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    console.log('🖥️  Running on Node.js runtime');
    
    // In production, you could initialize monitoring services here:
    // - Sentry for error tracking
    // - New Relic for performance monitoring
    // - DataDog for full observability
    // - OpenTelemetry for distributed tracing
    
    // Example: Track server startup time
    const startTime = Date.now();
    
    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const initTime = Date.now() - startTime;
    console.log(`✅ Server instrumentation complete (${initTime}ms)`);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    console.log('⚡ Running on Edge runtime');
  }
}

/**
 * This function is called when the server is shutting down
 * Use it to clean up resources
 */
export async function onRequestError(
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
) {
  console.error('❌ Request Error:', {
    error: err.message,
    path: request.path,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // In production, send to error tracking service
  // Example: Sentry.captureException(err);
}
