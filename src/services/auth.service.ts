import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../configs/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh';
  exp?: number; // Expiration timestamp (Unix time)
  iat?: number; // Issued at timestamp (Unix time)
  iss?: string; // Issuer
  aud?: string; // Audience
  jti?: string; // JWT ID (used for refresh tokens)
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenData {
  userId: string;
  email: string;
  role: string;
  familyId: string;
  userAgent?: string;
  ip?: string;
  deviceId?: string;
}

export class AuthService {
  /**
   * Generate access token (JWT)
   */
  static generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    const jwtPayload: JwtPayload = {
      ...payload,
      tokenType: 'access',
    };

    return jwt.sign(jwtPayload, env.jwt.accessTokenSecret, {
      expiresIn: env.jwt.accessTokenExpiry,
      issuer: 'ecom-backend',
      audience: 'ecom-frontend',
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token (JWT)
   */
  static generateRefreshToken(data: RefreshTokenData): string {
    const jwtPayload: JwtPayload = {
      userId: data.userId,
      email: data.email,
      role: data.role,
      tokenType: 'refresh',
    };

    return jwt.sign(jwtPayload, env.jwt.refreshTokenSecret, {
      expiresIn: env.jwt.refreshTokenExpiry,
      issuer: 'ecom-backend',
      audience: 'ecom-frontend',
      jwtid: data.familyId, // Use familyId as JWT ID
    } as jwt.SignOptions);
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(
    user: { userId: string; email: string; role: string },
    deviceInfo: { userAgent?: string; ip?: string; deviceId?: string } = {},
  ): { tokens: TokenPair; familyId: string } {
    const familyId = crypto.randomUUID();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken({
      ...user,
      familyId,
      ...deviceInfo,
    });

    return {
      tokens: { accessToken, refreshToken },
      familyId,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.jwt.accessTokenSecret, {
        issuer: 'ecom-backend',
        audience: 'ecom-frontend',
      }) as JwtPayload;

      if (decoded.tokenType !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload & { familyId: string } {
    try {
      const decoded = jwt.verify(token, env.jwt.refreshTokenSecret, {
        issuer: 'ecom-backend',
        audience: 'ecom-frontend',
      }) as JwtPayload & { jti: string };

      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        ...decoded,
        familyId: decoded.jti, // JWT ID contains our familyId
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Generate a secure token hash for storage
   */
  static generateTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Calculate token expiration date
   */
  static calculateExpirationDate(expiresIn: string): Date {
    const now = new Date();

    // Parse the expiresIn string (e.g., "7d", "15m", "1h")
    const match = expiresIn.match(/^(\d+)([smhdwy])$/);
    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 's':
        return new Date(now.getTime() + numValue * 1000);
      case 'm':
        return new Date(now.getTime() + numValue * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + numValue * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000);
      case 'w':
        return new Date(now.getTime() + numValue * 7 * 24 * 60 * 60 * 1000);
      case 'y':
        return new Date(now.getTime() + numValue * 365 * 24 * 60 * 60 * 1000);
      default:
        throw new Error('Invalid time unit');
    }
  }
}
