import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createOrder,
    updateOrderStatusByShop,
    assignDeliveryCompany,
    assignDeliveryStaff,
    getAllOrders,
    deleteOrder,
    getOrdersByShop
} from "../controller/orderController.js";

const router = express.Router();

// customer
router.post("/create", protect, createOrder);

// shop-admin
router.put("/:orderId/status", protect, updateOrderStatusByShop);
// view all order shop-admin
router.get("/shop/:shopId", protect, getOrdersByShop);
// shop-admin → assign delivery company
router.put(
    "/:orderId/assign-company",
    protect,
    assignDeliveryCompany
);

// admin

router.get("/", protect, getAllOrders);
router.delete("/:orderId", protect, deleteOrder);

// delivery-company admin
router.put("/:orderId/assign-staff", protect, assignDeliveryStaff);

//customer


export default router;
