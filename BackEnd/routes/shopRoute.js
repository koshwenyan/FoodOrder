import express from "express";
import {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop
} from "../controller/shopController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
// import { adminMiddleware } from "../middleware/adminMiddleware.js"; // optional

const router = express.Router();

// ================= SHOP ROUTES =================

// CREATE SHOP
router.post(
    "/create",
    authMiddleware,               // user must be logged in
    // adminMiddleware("admin"),   // uncomment if admin-only
    createShop
);

// GET ALL SHOPS
router.get("/", getAllShops);

// GET SHOP BY ID
router.get("/:shopId", getShopById);

// UPDATE SHOP
router.put(
    "/:shopId",
    authMiddleware,
    // adminMiddleware("admin"),
    updateShop
);

// DELETE SHOP
router.delete(
    "/:shopId",
    authMiddleware,
    // adminMiddleware("admin"),
    deleteShop
);

export default router;
