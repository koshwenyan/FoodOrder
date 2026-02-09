import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createOrder,
    updateOrderStatus,
    assignDeliveryCompany,
    assignDeliveryStaff,
    getAllOrders,
    deleteOrder,
    getOrdersByShop,
    getMyOrders,
    getMyOrderById,
    getOrderStaffLocation,
    getMyDeliveryOrders,
    getOrdersByCompany,
    getCompanyOrderCounts,
    getStaffPickedAndDeliveredOrders,
    getShopOrderStatusTotals
} from "../controller/orderController.js";

const router = express.Router();

// customer
router.post("/create", protect, createOrder);

// shop-admin and staff
router.put("/:orderId/status", protect, updateOrderStatus);

//shop view total order status
router.get(
    "/shop/orders/totals",
    protect,
    getShopOrderStatusTotals
);

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

// delivery-company assigned staff
router.put("/:orderId/assign-staff", protect, assignDeliveryStaff);

//customer view of all my orders
router.get("/myorders", protect, getMyOrders);

// Get a specific order by ID for logged-in customer
router.get("/myorders/:orderId", protect, getMyOrderById);
router.get("/myorders/:orderId/staff-location", protect, getOrderStaffLocation);

// Company (company-admin)
router.get(
    "/company/orders",
    protect,
    getOrdersByCompany
);

router.get(
    "/company/order-counts",
    protect,
    getCompanyOrderCounts
);


// Delivery staff
router.get(
    "/delivery/my-orders",
    protect,
    getMyDeliveryOrders
);
router.get(
    "/staff/my-orders/status",
    protect,
    getStaffPickedAndDeliveredOrders
);



export default router;
