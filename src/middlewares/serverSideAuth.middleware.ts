import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RefreshTokenService } from '../services/refreshToken.service';

/**
 * Server-side automatic token refresh middleware
 */
export const serverSideAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = AuthService.extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING',
      });
    }

    try {
      // Try to verify the access token
      const decoded = AuthService.verifyAccessToken(accessToken);

      // Get user from database
      const user = await UserService.findUserById(decoded.userId);

      if (!user || user.getDataValue('deletedAt')) {
        return res.status(401).json({
          success: false,
          message: 'User not found or deactivated',
          code: 'USER_NOT_FOUND',
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

      // Check if token expires soon (within 2 minutes) - proactive refresh
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;

      if (timeUntilExpiry < 2 * 60) {
        // Less than 2 minutes
        // Suggest client to refresh soon
        res.setHeader('X-Token-Refresh-Suggested', 'true');
        res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString());
      }

      return next();
    } catch (error) {
      // Access token is invalid or expired
      if (error instanceof Error && error.message === 'Access token expired') {
        // 🔄 AUTOMATIC SERVER-SIDE REFRESH
        console.log('🔄 Access token expired, attempting server-side refresh...');

        // Look for refresh token in headers or cookies
        const refreshToken =
          (req.headers['x-refresh-token'] as string) || req.cookies?.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Access token expired and no refresh token provided',
            code: 'REFRESH_TOKEN_MISSING',
          });
        }

        try {
          // Validate and rotate refresh token
          const rotationResult = await RefreshTokenService.rotateRefreshToken(
            refreshToken,
            {
              userId: req.body.userId || 'unknown', // We'll need to decode from refresh token
              email: req.body.email || 'unknown',
              role: req.body.role || 'customer',
            },
            {
              userAgent: req.headers['user-agent'],
              ip: req.ip,
              deviceId: req.headers['x-device-id'] as string,
            },
          );

          if (!rotationResult) {
            return res.status(401).json({
              success: false,
              message: 'Refresh token validation failed',
              code: 'INVALID_REFRESH_TOKEN',
            });
          }

          // 📤 SEND NEW TOKENS TO CLIENT VIA HEADERS
          res.setHeader('X-New-Access-Token', rotationResult.newAccessToken);
          res.setHeader('X-New-Refresh-Token', rotationResult.newToken);
          res.setHeader('X-Token-Refreshed', 'true');

          console.log('✅ Tokens refreshed automatically on server');

          // Verify new access token and continue with request
          const newDecoded = AuthService.verifyAccessToken(rotationResult.newAccessToken);
          const user = await UserService.findUserById(newDecoded.userId);

          req.user = {
            id: user!.getDataValue('id'),
            email: user!.getDataValue('email'),
            role: user!.getDataValue('role'),
            firstName: user!.getDataValue('firstName'),
            lastName: user!.getDataValue('lastName'),
          };

          return next();
        } catch (refreshError) {
          console.error('❌ Server-side refresh failed:', refreshError);
          return res.status(401).json({
            success: false,
            message: 'Token refresh failed',
            code: 'TOKEN_REFRESH_FAILED',
          });
        }
      }

      // Other token errors
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'TOKEN_INVALID',
      });
    }
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
 * Improved version that decodes refresh token to get user info
 */
export const smartServerSideAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = AuthService.extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING',
      });
    }

    try {
      // Try to verify access token
      const decoded = AuthService.verifyAccessToken(accessToken);
      const user = await UserService.findUserById(decoded.userId);

      if (!user || user.getDataValue('deletedAt')) {
        return res.status(401).json({
          success: false,
          message: 'User not found or deactivated',
          code: 'USER_NOT_FOUND',
        });
      }

      req.user = {
        id: user.getDataValue('id'),
        email: user.getDataValue('email'),
        role: user.getDataValue('role'),
        firstName: user.getDataValue('firstName'),
        lastName: user.getDataValue('lastName'),
      };

      return next();
    } catch (error) {
      if (error instanceof Error && error.message === 'Access token expired') {
        // Get refresh token
        const refreshToken =
          (req.headers['x-refresh-token'] as string) || req.cookies?.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Access token expired and no refresh token provided',
            code: 'REFRESH_TOKEN_MISSING',
          });
        }

        try {
          // 🔍 DECODE REFRESH TOKEN TO GET USER INFO
          const refreshDecoded = AuthService.verifyRefreshToken(refreshToken);

          // Validate refresh token in database
          const validation = await RefreshTokenService.validateRefreshToken(refreshToken);

          if (!validation.isValid || !validation.tokenInfo) {
            return res.status(401).json({
              success: false,
              message: validation.reason || 'Invalid refresh token',
              code: 'INVALID_REFRESH_TOKEN',
            });
          }

          // Get user data
          const user = await UserService.findUserById(validation.tokenInfo.userId);

          if (!user || user.getDataValue('deletedAt')) {
            return res.status(401).json({
              success: false,
              message: 'User not found or deactivated',
              code: 'USER_NOT_FOUND',
            });
          }

          // Rotate tokens
          const userData = {
            userId: user.getDataValue('id'),
            email: user.getDataValue('email'),
            role: user.getDataValue('role'),
          };

          const rotationResult = await RefreshTokenService.rotateRefreshToken(
            refreshToken,
            userData,
            {
              userAgent: req.headers['user-agent'],
              ip: req.ip,
              deviceId: req.headers['x-device-id'] as string,
            },
          );

          if (!rotationResult) {
            return res.status(401).json({
              success: false,
              message: 'Token rotation failed',
              code: 'TOKEN_ROTATION_FAILED',
            });
          }

          // 📤 SEND NEW TOKENS VIA HEADERS
          res.setHeader('X-New-Access-Token', rotationResult.newAccessToken);
          res.setHeader('X-New-Refresh-Token', rotationResult.newToken);
          res.setHeader('X-Token-Refreshed', 'true');
          res.setHeader(
            'Access-Control-Expose-Headers',
            'X-New-Access-Token,X-New-Refresh-Token,X-Token-Refreshed',
          );

          // Continue with request
          req.user = {
            id: user.getDataValue('id'),
            email: user.getDataValue('email'),
            role: user.getDataValue('role'),
            firstName: user.getDataValue('firstName'),
            lastName: user.getDataValue('lastName'),
          };

          return next();
        } catch (refreshError) {
          return res.status(401).json({
            success: false,
            message: 'Token refresh failed',
            code: 'TOKEN_REFRESH_FAILED',
          });
        }
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};
