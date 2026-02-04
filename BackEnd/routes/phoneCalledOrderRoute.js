import express from "express";
import {
    createPhoneCalledOrder,

    getPhoneCalledOrderById,
    getPhoneCalledOrderTotalByShop,
} from "../controller/phoneCalledOrderController.js";
import { authMiddleware, protect } from "../middleware/authMiddleware.js";


const phoneRouter = express.Router();

phoneRouter.post("/", protect, createPhoneCalledOrder);
phoneRouter.get("/shop/:shopId", protect, getPhoneCalledOrderTotalByShop);
phoneRouter.get("/:id", protect, getPhoneCalledOrderById);

export default phoneRouter;
