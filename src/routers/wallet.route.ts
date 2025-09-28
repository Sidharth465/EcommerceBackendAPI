import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { transferWalletSchema } from "../validators/wallet.validator";

const router = Router();


router.get("/:userId",WalletController.getWallet);
router.post("/payment",validateRequest(transferWalletSchema),WalletController.updateWalletDuringTransaction);


export default router;