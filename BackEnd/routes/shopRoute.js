import express from "express";
import {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop
} from "../controller/shopController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const shopRouter = express.Router();

/* ===== PUBLIC ===== */
shopRouter.get("/", getAllShops);
shopRouter.get("/:shopId", getShopById);

/* ===== ADMIN ONLY ===== */
shopRouter.post("/", authMiddleware, adminMiddleware("admin"), createShop);
shopRouter.put("/:shopId", authMiddleware, adminMiddleware("admin"), updateShop);
shopRouter.delete("/:shopId", authMiddleware, adminMiddleware("admin"), deleteShop);

export default shopRouter;
