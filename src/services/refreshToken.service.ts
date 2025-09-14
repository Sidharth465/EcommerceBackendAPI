import { Op } from 'sequelize';
import { sequelize } from '../configs/database';
import { initModels } from '../models';
import { AuthService } from './auth.service';
import { env } from '../configs/env';

// Initialize models
const models = initModels(sequelize);

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
  deviceId?: string;
}

export interface RefreshTokenInfo {
  id: string;
  userId: string;
  familyId: string;
  userAgent?: string;
  ip?: string;
  deviceId?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export class RefreshTokenService {
  /**
   * Create a new refresh token in the database
   */
  static async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenInfo> {
    const refreshToken = await models.RefreshToken.create({
      userId: data.userId,
      tokenHash: data.tokenHash,
      familyId: data.familyId,
      expiresAt: data.expiresAt,
      userAgent: data.userAgent,
      ip: data.ip,
      deviceId: data.deviceId,
    });

    return {
      id: refreshToken.getDataValue('id'),
      userId: refreshToken.getDataValue('userId'),
      familyId: refreshToken.getDataValue('familyId'),
      userAgent: refreshToken.getDataValue('userAgent'),
      ip: refreshToken.getDataValue('ip'),
      deviceId: refreshToken.getDataValue('deviceId'),
      expiresAt: refreshToken.getDataValue('expiresAt'),
      revokedAt: refreshToken.getDataValue('revokedAt'),
      createdAt: refreshToken.getDataValue('createdAt'),
    };
  }

  /**
   * Find refresh token by hash
   */
  static async findByTokenHash(tokenHash: string): Promise<RefreshTokenInfo | null> {
    const refreshToken = await models.RefreshToken.findOne({
      where: { tokenHash },
    });

    if (!refreshToken) {
      return null;
    }

    return {
      id: refreshToken.getDataValue('id'),
      userId: refreshToken.getDataValue('userId'),
      familyId: refreshToken.getDataValue('familyId'),
      userAgent: refreshToken.getDataValue('userAgent'),
      ip: refreshToken.getDataValue('ip'),
      deviceId: refreshToken.getDataValue('deviceId'),
      expiresAt: refreshToken.getDataValue('expiresAt'),
      revokedAt: refreshToken.getDataValue('revokedAt'),
      createdAt: refreshToken.getDataValue('createdAt'),
    };
  }

  /**
   * Find refresh token by family ID
   */
  static async findByFamilyId(familyId: string): Promise<RefreshTokenInfo[]> {
    const refreshTokens = await models.RefreshToken.findAll({
      where: { familyId },
      order: [['createdAt', 'DESC']],
    });

    return refreshTokens.map((token) => ({
      id: token.getDataValue('id'),
      userId: token.getDataValue('userId'),
      familyId: token.getDataValue('familyId'),
      userAgent: token.getDataValue('userAgent'),
      ip: token.getDataValue('ip'),
      deviceId: token.getDataValue('deviceId'),
      expiresAt: token.getDataValue('expiresAt'),
      revokedAt: token.getDataValue('revokedAt'),
      createdAt: token.getDataValue('createdAt'),
    }));
  }

  /**
   * Revoke a specific refresh token
   */
  static async revokeToken(tokenHash: string, replacedByTokenId?: string): Promise<boolean> {
    const [affectedRows] = await models.RefreshToken.update(
      {
        revokedAt: new Date(),
        replacedByTokenId,
      },
      {
        where: {
          tokenHash,
          revokedAt: null, // Only revoke if not already revoked
        },
      },
    );

    return affectedRows > 0;
  }

  /**
   * Revoke all tokens in a family (for security breaches)
   */
  static async revokeTokenFamily(familyId: string): Promise<number> {
    const [affectedRows] = await models.RefreshToken.update(
      {
        revokedAt: new Date(),
      },
      {
        where: {
          familyId,
          revokedAt: null,
        },
      },
    );

    return affectedRows;
  }

  /**
   * Revoke all tokens for a user
   */
  static async revokeAllUserTokens(userId: string): Promise<number> {
    const [affectedRows] = await models.RefreshToken.update(
      {
        revokedAt: new Date(),
      },
      {
        where: {
          userId,
          revokedAt: null,
        },
      },
    );

    return affectedRows;
  }

  /**
   * Clean up expired refresh tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const deletedCount = await models.RefreshToken.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });

    return deletedCount;
  }

  /**
   * Validate refresh token and check security
   */
  static async validateRefreshToken(token: string): Promise<{
    isValid: boolean;
    tokenInfo?: RefreshTokenInfo;
    reason?: string;
  }> {
    try {
      // First verify the JWT structure and signature
      const decodedToken = AuthService.verifyRefreshToken(token);

      // Generate hash to find in database
      const tokenHash = AuthService.generateTokenHash(token);

      // Find token in database
      const tokenInfo = await this.findByTokenHash(tokenHash);

      if (!tokenInfo) {
        return { isValid: false, reason: 'Token not found in database' };
      }

      // Check if token is revoked
      if (tokenInfo.revokedAt) {
        // Token reuse detected - revoke entire family for security
        await this.revokeTokenFamily(tokenInfo.familyId);
        return { isValid: false, reason: 'Token reuse detected - all family tokens revoked' };
      }

      // Check if token is expired (database expiry)
      if (tokenInfo.expiresAt < new Date()) {
        return { isValid: false, reason: 'Token expired' };
      }

      // Verify family ID matches
      if (tokenInfo.familyId !== decodedToken.familyId) {
        return { isValid: false, reason: 'Token family mismatch' };
      }

      return { isValid: true, tokenInfo };
    } catch (error) {
      if (error instanceof Error) {
        return { isValid: false, reason: error.message };
      }
      return { isValid: false, reason: 'Unknown validation error' };
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getUserActiveSessions(userId: string): Promise<
    {
      familyId: string;
      userAgent?: string;
      ip?: string;
      deviceId?: string;
      lastActivity: Date;
      tokensCount: number;
    }[]
  > {
    const sessions = await models.RefreshToken.findAll({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      attributes: [
        'familyId',
        'userAgent',
        'ip',
        'deviceId',
        [sequelize.fn('MAX', sequelize.col('created_at')), 'lastActivity'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'tokensCount'],
      ],
      group: ['familyId', 'userAgent', 'ip', 'deviceId'],
      order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
    });

    return sessions.map((session) => ({
      familyId: session.getDataValue('familyId'),
      userAgent: session.getDataValue('userAgent'),
      ip: session.getDataValue('ip'),
      deviceId: session.getDataValue('deviceId'),
      lastActivity: session.getDataValue('lastActivity'),
      tokensCount: parseInt(session.getDataValue('tokensCount'), 10),
    }));
  }

  /**
   * Rotate refresh token (create new one and revoke old one)
   */
  static async rotateRefreshToken(
    oldToken: string,
    userData: { userId: string; email: string; role: string },
    deviceInfo: { userAgent?: string; ip?: string; deviceId?: string } = {},
  ): Promise<{ newToken: string; newAccessToken: string } | null> {
    try {
      // Validate the old token first
      const validation = await this.validateRefreshToken(oldToken);

      if (!validation.isValid || !validation.tokenInfo) {
        return null;
      }

      const oldTokenInfo = validation.tokenInfo;

      // Generate new token pair with the same family ID
      const newAccessToken = AuthService.generateAccessToken(userData);
      const newRefreshToken = AuthService.generateRefreshToken({
        ...userData,
        familyId: oldTokenInfo.familyId, // Keep same family
        ...deviceInfo,
      });

      // Calculate expiration date
      const expiresAt = AuthService.calculateExpirationDate(env.jwt.refreshTokenExpiry);

      // Create new refresh token in database
      const newTokenHash = AuthService.generateTokenHash(newRefreshToken);
      const newTokenInfo = await this.createRefreshToken({
        userId: userData.userId,
        tokenHash: newTokenHash,
        familyId: oldTokenInfo.familyId,
        expiresAt,
        userAgent: deviceInfo.userAgent || oldTokenInfo.userAgent,
        ip: deviceInfo.ip || oldTokenInfo.ip,
        deviceId: deviceInfo.deviceId || oldTokenInfo.deviceId,
      });

      // Revoke the old token
      const oldTokenHash = AuthService.generateTokenHash(oldToken);
      await this.revokeToken(oldTokenHash, newTokenInfo.id);

      return {
        newToken: newRefreshToken,
        newAccessToken,
      };
    } catch (error) {
      console.error('Error rotating refresh token:', error);
      return null;
    }
  }
}
