import { DataTypes, Sequelize } from 'sequelize';

export const defineRefreshTokenModel = (sequelize: Sequelize) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      tokenHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'token_hash',
      },
      familyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'family_id',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
      replacedByTokenId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'replaced_by_token_id',
      },
      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'user_agent',
      },
      ip: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      deviceId: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'device_id',
      },
    },
    {
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['tokenHash'], unique: true },
        { fields: ['familyId'] },
        { fields: ['expiresAt'] },
        { fields: ['revokedAt'] },
      ],
    },
  );

  return RefreshToken;
};
