import { DataTypes, Sequelize } from 'sequelize';

export const defineProductModel = (sequelize: Sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        references: {
          model: 'categories',
          key: 'id',
        },
        allowNull: false,
        field: 'category_id',
      },
      imageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'image_url',
      },
      ratingRate: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        field: 'rating_rate',
        validate: {
          min: 0,
          max: 5,
        },
      },
      ratingCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'rating_count',
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'stock_quantity',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'products',
      paranoid: true,
      underscored: true,
      indexes: [
        { fields: ['title'] },
        { fields: ['slug'], unique: true },
        { fields: ['category_id'] },
        { fields: ['price'] },
        { fields: ['rating_rate'] },
        { fields: ['is_active'] },
      ],
    },
  );

  return Product;
};
