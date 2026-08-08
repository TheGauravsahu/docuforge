import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login/registration attempts, please try again later.' },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit AI generation calls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for AI generation. Please wait a minute.' },
});
