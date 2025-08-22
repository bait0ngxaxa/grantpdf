// lib/ratelimit.ts
interface RateLimitRecord {
  count: number;
  lastRequest: number;
  firstRequest: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour - keep records for longer than window for better tracking
  
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.lastRequest > maxAge) {
      rateLimitMap.delete(ip);
    }
  }
  
  // Log cleanup for monitoring (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[RateLimit] Cleanup completed. Active IPs: ${rateLimitMap.size}`);
  }
}, CLEANUP_INTERVAL);

// Cleanup on process termination
process.on('SIGTERM', () => {
  clearInterval(cleanupTimer);
});

process.on('SIGINT', () => {
  clearInterval(cleanupTimer);
});

/**
 * Rate limiting function with sliding window algorithm
 * @param ip - Client IP address
 * @param limit - Maximum number of requests allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns RateLimitResult with success status and metadata
 */
export function rateLimit(
  ip: string, 
  limit: number = 5, 
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record exists or window has expired, create new record
  if (!record || now - record.firstRequest > windowMs) {
    const newRecord: RateLimitRecord = {
      count: 1,
      lastRequest: now,
      firstRequest: now
    };
    
    rateLimitMap.set(ip, newRecord);
    
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    };
  }

  // Check if limit exceeded
  if (record.count >= limit) {
    const resetTime = record.firstRequest + windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000); // seconds until reset
    
    return {
      success: false,
      remaining: 0,
      resetTime,
      retryAfter: retryAfter > 0 ? retryAfter : 1
    };
  }

  // Increment counter and update last request time
  record.count++;
  record.lastRequest = now;
  rateLimitMap.set(ip, record);

  const resetTime = record.firstRequest + windowMs;
  
  return {
    success: true,
    remaining: Math.max(0, limit - record.count),
    resetTime
  };
}

/**
 * Get current rate limit status for an IP without incrementing counter
 * @param ip - Client IP address
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Current status without affecting the counter
 */
export function getRateLimitStatus(
  ip: string,
  limit: number = 5,
  windowMs: number = 60_000
): Omit<RateLimitResult, 'success'> {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.firstRequest > windowMs) {
    return {
      remaining: limit,
      resetTime: now + windowMs
    };
  }

  const resetTime = record.firstRequest + windowMs;
  const retryAfter = record.count >= limit ? Math.ceil((resetTime - now) / 1000) : undefined;

  return {
    remaining: Math.max(0, limit - record.count),
    resetTime,
    ...(retryAfter && { retryAfter })
  };
}

/**
 * Reset rate limit for a specific IP (useful for testing or admin overrides)
 * @param ip - Client IP address to reset
 */
export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

/**
 * Get current statistics (useful for monitoring)
 */
export function getRateLimitStats() {
  return {
    totalIPs: rateLimitMap.size,
    memoryUsage: `${Math.round(JSON.stringify([...rateLimitMap]).length / 1024)}KB`
  };
}

/**
 * Helper function to get client IP from Next.js request
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (depending on proxy setup)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback to a default value if no IP is found
  return 'unknown';
}