import { sequelize } from "../configs/database";
import {Request,Response} from "express"
import { WalletService } from "../services/wallet.service";
import { UserService } from "../services/user.service";


export class WalletController {
    static async createWallet(req:Request,res:Response){
        const transaction = await sequelize.transaction();
        try {
            const {user_id,amount} = req.body;
            if(!user_id || !amount){
                return res.status(400).json({message:"Please provide user id and amount"})
            }
           const wallet =  await WalletService.createWallet(user_id,{amount},transaction);
           if(!wallet) {
               await transaction.rollback();
               return res.status(500).json({message:"Error creating wallet"})
           }
           await transaction.commit();
           return res.status(201).json({wallet})

        } catch (error) {
            await transaction.rollback()
            res.status(500).json({
                success: false,
                message: 'Internal server error',
              });
            
        }
    }
    static async updateWalletDuringTransaction(req:Request,res:Response){
        const transaction = await sequelize.transaction();
        try {
            const {senderId,receiverId,amount} = req.body;
            console.log("updateWalletDuringTransaction",JSON.stringify(req.body));
            if(!senderId || !receiverId || !amount){
                return res.status(400).json({message:"Please provide sender wallet id , receiver wallet id and amount"})
            }
            // check if the sender has enough balance to send the money
            const senderWallet = await WalletService.getWalletByUserId(senderId);
            console.log("senderWallet",senderWallet);
            if(!senderWallet){
                return res.status(404).json({message:"Sender wallet not found"})
            }
            if(senderWallet.amount < amount){
                return res.status(404).json({message:"Insufficient funds to transfer money"})
            }
            const recieverWallet = await WalletService.getWalletByUserId(receiverId);
            console.log("recieverWallet",recieverWallet);
            if(!recieverWallet){
                return res.status(404).json({message:"Reciever wallet not found"})
            }
            // deduct the amount from the sender's wallet
            await WalletService.deductBalanceFromWallet(senderWallet.id,amount,transaction);
            // add the amount to the receiver's wallet
            await WalletService.addBalanceToWallet(recieverWallet.id,amount,transaction);

        transaction.commit();
        return res.status(200).json({message:"Money sent successfully"})

            
        } catch (error) {
            await transaction.rollback()
            if(error instanceof Error){
                return res.status(500).json({message:error.message});
            }
            await transaction.rollback()
            res.status(500).json({
                success: false,
                message: 'Internal server error',
              })
            
        }
    }

    static async getWallet(req:Request,res:Response){
        try {
            const userId = req.params.userId;
        console.log("userId",userId);
        // check if the user exists in the database
        const user =  await UserService.findUserById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
        }
        const senderWallet = await WalletService.getWalletByUserId(userId);
        if(!senderWallet){
            return res.status(404).json({message:"Wallet not found"})
        }
        return res.status(200).json({id:senderWallet.id,balance:senderWallet.amount})
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
              })
        }
    }
}