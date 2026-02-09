import express from "express";
import {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    getMenusByShop,

} from "../controller/menuController.js";
import { protect } from "../middleware/authMiddleware.js";

const menuRouter = express.Router();

// shop-admin only
menuRouter.post("/create", protect, createMenu);
menuRouter.put("/update/:id", protect, updateMenu);
menuRouter.delete("/delete/:id", protect, deleteMenu);

// public / authenticated
menuRouter.get("/shop/:shopId", getMenusByShop);
menuRouter.get("/my-shop", protect, getAllMenus);

menuRouter.get("/:id", getMenuById);


export default menuRouter;
