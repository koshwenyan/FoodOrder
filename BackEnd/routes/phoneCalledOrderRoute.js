import express from "express";
import {
    createPhoneCalledOrder,

    getPhoneCalledOrderById,
    getPhoneCalledOrderTotalByShop,
    getPhoneCalledOrdersByCompany,
    assignPhoneCalledOrderStaff,
    updatePhoneCalledOrderStatus,
    getPhoneCalledOrdersByStaff,
} from "../controller/phoneCalledOrderController.js";
import { authMiddleware, protect } from "../middleware/authMiddleware.js";


const phoneRouter = express.Router();

phoneRouter.post("/", protect, createPhoneCalledOrder);
phoneRouter.get("/shop/:shopId", protect, getPhoneCalledOrderTotalByShop);
phoneRouter.get("/company/orders", protect, getPhoneCalledOrdersByCompany);
phoneRouter.get("/delivery/my-orders", protect, getPhoneCalledOrdersByStaff);
phoneRouter.put("/:orderId/assign-staff", protect, assignPhoneCalledOrderStaff);
phoneRouter.put("/:orderId/status", protect, updatePhoneCalledOrderStatus);
phoneRouter.get("/:id", protect, getPhoneCalledOrderById);

export default phoneRouter;
