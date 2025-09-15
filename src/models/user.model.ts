import { DataTypes, Sequelize } from 'sequelize';

export const defineUserModel = (sequelize: Sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'last_name',
      },
      role: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'customer',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      tableName: 'users',
      paranoid: true,
      indexes: [{ unique: true, fields: ['email'] }],
      underscored: true,
      timestamps: true,
    },
  );

  return User;
};
