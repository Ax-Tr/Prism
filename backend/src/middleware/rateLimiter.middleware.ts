import rateLimit from 'express-rate-limit';

// General API rate limiter (100 requests per minute)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 60 seconds.',
  },
});

// Strict rate limiter for authentication routes (10 attempts per minute)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 1 minute.',
  },
});
