import { Sequelize } from "sequelize";
import { defineUserModel } from "./user.model";
import { defineRefreshTokenModel } from "./refreshToken.model";
import { defineCategoryModel } from "./category.model";
import { defineProductModel } from "./product.model";

export const initModels = (sequelize: Sequelize) => {
  const User = defineUserModel(sequelize);
  const RefreshToken = defineRefreshTokenModel(sequelize);
  const Category = defineCategoryModel(sequelize);
  const Product = defineProductModel(sequelize);

  // User - RefreshToken associations
  User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
  RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

  // Category - Product associations
  Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
  Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  return { User, RefreshToken, Category, Product };
};
