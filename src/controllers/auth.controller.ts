import { Request, Response } from 'express';
import { UserService, CreateUserData } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { RefreshTokenService } from '../services/refreshToken.service';
import { env } from '../configs/env';
import { WalletService } from '../services/wallet.service';
import { sequelize } from '../configs/database';


export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    const Transaction = await sequelize.transaction()
    try {

      const userData: CreateUserData = req.body;
      console.log("userData",userData)
      const user = await UserService.registerUser(userData,Transaction);

    const wallet=await WalletService.createWallet(user.id,{amount:0},Transaction)
    console.log("wallet",JSON.stringify(wallet))
    await Transaction.commit()
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error) {

      await Transaction.rollback()

      // Handle known errors
      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
      }

      // Handle unexpected errors
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Check if user is soft deleted
      const deletedAt = user.getDataValue('deletedAt');
      if (deletedAt) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED',
        });
      }

      // Verify password
      const passwordHash = user.getDataValue('passwordHash');
      const isValidPassword = await UserService.verifyPassword(password, passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Extract device information
      const userAgent = req.headers['user-agent'];
      const ip = req.ip || req.connection.remoteAddress;
      const deviceId = req.headers['x-device-id'] as string | undefined;

      // Generate token pair
      const userData = {
        userId: user.getDataValue('id'),
        email: user.getDataValue('email'),
        role: user.getDataValue('role'),
      };

      const { tokens, familyId } = AuthService.generateTokenPair(userData, {
        userAgent,
        ip,
        deviceId,
      });

      // Store refresh token in database
      const refreshTokenHash = AuthService.generateTokenHash(tokens.refreshToken);
      const expiresAt = AuthService.calculateExpirationDate(env.jwt.refreshTokenExpiry);

      await RefreshTokenService.createRefreshToken({
        userId: userData.userId,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt,
        userAgent,
        ip,
        deviceId,
      });

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.getDataValue('id'),
            email: user.getDataValue('email'),
            firstName: user.getDataValue('firstName'),
            lastName: user.getDataValue('lastName'),
            role: user.getDataValue('role'),
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: env.jwt.accessTokenExpiry,
            refreshTokenExpiresIn: env.jwt.refreshTokenExpiry,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
          code: 'REFRESH_TOKEN_MISSING',
        });
      }

      // Validate refresh token
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

      // Extract device information
      const userAgent = req.headers['user-agent'];
      const ip = req.ip || req.connection.remoteAddress;
      const deviceId = req.headers['x-device-id'] as string | undefined;

      // Rotate refresh token
      const userData = {
        userId: user.getDataValue('id'),
        email: user.getDataValue('email'),
        role: user.getDataValue('role'),
      };

      const rotationResult = await RefreshTokenService.rotateRefreshToken(refreshToken, userData, {
        userAgent,
        ip,
        deviceId,
      });

      if (!rotationResult) {
        return res.status(401).json({
          success: false,
          message: 'Failed to refresh token',
          code: 'TOKEN_ROTATION_FAILED',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: rotationResult.newAccessToken,
            refreshToken: rotationResult.newToken,
            accessTokenExpiresIn: env.jwt.accessTokenExpiry,
            refreshTokenExpiresIn: env.jwt.refreshTokenExpiry,
          },
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        const tokenHash = AuthService.generateTokenHash(refreshToken);
        await RefreshTokenService.revokeToken(tokenHash);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Logout from all devices (revoke all refresh tokens)
   */
  static async logoutAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'NOT_AUTHENTICATED',
        });
      }

      const revokedCount = await RefreshTokenService.revokeAllUserTokens(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices',
        data: {
          revokedTokens: revokedCount,
        },
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Get user's active sessions
   */
  static async getSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'NOT_AUTHENTICATED',
        });
      }

      const sessions = await RefreshTokenService.getUserActiveSessions(userId);

      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved',
        data: {
          sessions,
        },
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}
