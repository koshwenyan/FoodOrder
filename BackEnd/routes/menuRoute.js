import express from "express";
import {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu
} from "../controller/menuController.js";
import { protect } from "../middleware/authMiddleware.js";

const menuRouter = express.Router();

// shop-admin only
menuRouter.post("/", protect, createMenu);
menuRouter.put("/:id", protect, updateMenu);
menuRouter.delete("/:id", protect, deleteMenu);

// public / authenticated
menuRouter.get("/shop/:shopId", getAllMenus);
menuRouter.get("/:id", getMenuById);

export default menuRouter;
