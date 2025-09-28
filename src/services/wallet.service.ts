import { Transaction } from "sequelize";
import { sequelize } from "../configs/database";
import { initModels } from "../models";

const models = initModels(sequelize);

export interface CreateWalletData {
  amount: number;
}

export interface WalletResponse {
  id: string;
  amount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WalletService {
  static async createWallet(
    userId: string,
    walletData: CreateWalletData,
    transaction: Transaction
  ): Promise<WalletResponse> {
    const wallet = await models.Wallet.create(
      {
        ...walletData,
        userId,
      },
      { transaction }
    );


    return wallet.get({ plain: true }) as WalletResponse;
  }

static async addBalanceToWallet(walletId: string, amount: number,transaction: Transaction) {
    const [affectedRows] = await models.Wallet.update(
      { amount: sequelize.literal(`amount + ${amount}`) },
      { where: { id: walletId }, returning: false }
    );
    return affectedRows > 0;
  }

  static async deductBalanceFromWallet(walletId: string, amount: number,transaction: Transaction) {
    const [affectedRows] = await models.Wallet.update(
      { amount: sequelize.literal(`amount - ${amount}`) },
      { where: { id: walletId }, returning: false }
    );
    return affectedRows > 0;
  }

  static async getWalletByUserId(userId: string) {
    const wallet = await models.Wallet.findOne({
      where: { userId },
    });
    if (!wallet) throw new Error("Wallet not found");
    return wallet.get({ plain: true }) as WalletResponse;
  }
}
