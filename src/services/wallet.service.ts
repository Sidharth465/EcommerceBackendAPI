import { Transaction } from "sequelize";
import { sequelize } from "../configs/database";
import { initModels } from "../models";

const models = initModels(sequelize);

export interface CreateWalletData {
  amount: number;
}

export interface WalletResponse {
  id: string;
  balance: number;
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
}
