import express from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controller/categoryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const categoryRouter = express.Router();

// ================= PUBLIC ROUTES =================
// Get all categories
categoryRouter.get("/all", authMiddleware, getAllCategories);

// Get category by ID
categoryRouter.get("/:categoryId", authMiddleware, getCategoryById);

// ================= ADMIN ROUTES =================
// Create a new category (admin only)
categoryRouter.post("/create", authMiddleware, adminMiddleware("admin"), createCategory);

// Update category (admin only)
categoryRouter.put("/:categoryId", authMiddleware, adminMiddleware("admin"), updateCategory);

// Delete category (admin only)
categoryRouter.delete("/:categoryId", authMiddleware, adminMiddleware("admin"), deleteCategory);

export default categoryRouter;
