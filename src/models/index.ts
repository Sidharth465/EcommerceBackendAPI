import { Sequelize, Transaction } from 'sequelize';
import { defineUserModel } from './user.model';
import { defineRefreshTokenModel } from './refreshToken.model';
import { defineCategoryModel } from './category.model';
import { defineProductModel } from './product.model';
import { defineWalletModel } from './wallet.model';
import { defineTransactionHistoryModel } from './transactionHistory.model';

export const initModels = (sequelize: Sequelize) => {
  const User = defineUserModel(sequelize);
  const RefreshToken = defineRefreshTokenModel(sequelize);
  const Category = defineCategoryModel(sequelize);
  const Product = defineProductModel(sequelize);
  const Wallet = defineWalletModel(sequelize);
  const TransactionHistory = defineTransactionHistoryModel(sequelize);


  // User - RefreshToken associations
  User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
  Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
  RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Category - Product associations
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });


  return { User, RefreshToken, Category, Product ,Wallet,TransactionHistory };
};
