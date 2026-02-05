import express from "express";
import {
    register,
    login,
    logout,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getLoginUser
} from "../controller/userController.js";

import { authMiddleware, adminMiddleware, protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// 👈 ALWAYS put static routes FIRST
userRouter.get("/me", protect, getLoginUser);

// User CRUD
userRouter.get("/all", authMiddleware, adminMiddleware("admin"), getAllUsers);
userRouter.get("/:id", authMiddleware, getUserById);
userRouter.put("/update/:id", authMiddleware, updateUser);
userRouter.delete("/:id", authMiddleware, deleteUser);

// Auth
userRouter.post("/login", login);
userRouter.post("/logout", authMiddleware, logout);
// Public register for customer role; admin/staff roles still enforced in controller
userRouter.post("/register", register);

export default userRouter;
