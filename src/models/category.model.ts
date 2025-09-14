import { DataTypes, Sequelize } from "sequelize";

export const defineCategoryModel = (sequelize: Sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "categories",
      paranoid: true,
      underscored: true,
      indexes: [
        { fields: ["name"], unique: true },
        { fields: ["slug"], unique: true },
        { fields: ["is_active"] },
      ],
    }
  );

  return Category;
};
