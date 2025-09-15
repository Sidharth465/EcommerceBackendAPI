import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload } from '../services/auth.service';
import { UserService } from '../services/user.service';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Authentication middleware - verifies JWT access token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING',
      });
    }

    // Verify the access token
    let decoded: JwtPayload;
    try {
      decoded = AuthService.verifyAccessToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      const code = message.includes('expired') ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';

      return res.status(401).json({
        success: false,
        message,
        code,
      });
    }

    // Get user from database to ensure they still exist and are active
    const user = await UserService.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Check if user is soft deleted
    const deletedAt = user.getDataValue('deletedAt');
    if (deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        code: 'USER_DEACTIVATED',
      });
    }

    // Attach user info to request
    req.user = {
      id: user.getDataValue('id'),
      email: user.getDataValue('email'),
      role: user.getDataValue('role'),
      firstName: user.getDataValue('firstName'),
      lastName: user.getDataValue('lastName'),
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Authorization middleware factory - checks user roles
 */
export const authorize = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware - adds user info if token is present and valid
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    try {
      const decoded = AuthService.verifyAccessToken(token);
      const user = await UserService.findUserById(decoded.userId);

      if (user && !user.getDataValue('deletedAt')) {
        req.user = {
          id: user.getDataValue('id'),
          email: user.getDataValue('email'),
          role: user.getDataValue('role'),
          firstName: user.getDataValue('firstName'),
          lastName: user.getDataValue('lastName'),
        };
      }
    } catch (error) {
      // Invalid/expired token, but continue without authentication
      console.log(
        'Optional auth failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // Don't fail the request, just continue without authentication
    next();
  }
};

/**
 * Refresh token middleware - specifically for refresh endpoints
 */
export const requireRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
      code: 'REFRESH_TOKEN_MISSING',
    });
  }

  // Attach refresh token to request for use in controller
  req.body.refreshToken = refreshToken;
  next();
};

/**
 * Rate limiting for auth endpoints (basic implementation)
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();

    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or create new entry
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000),
      });
    }

    userAttempts.count++;
    next();
  };
};
