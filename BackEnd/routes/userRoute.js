import express from "express";
import {
    register,
    login,
    logout,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById
} from "../controller/userController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// ================= AUTH ROUTES =================
// Login
userRouter.post("/login", login);

// Logout (client should delete token)
userRouter.post("/logout", authMiddleware, logout);

// ================= USER MANAGEMENT =================
// Register new user
// Only authenticated users can create roles like company-staff/admin, shop-admin
userRouter.post("/register", authMiddleware, register);

// Get all users
// Only admin can access
userRouter.get("/all", authMiddleware, adminMiddleware("admin"), getAllUsers);

// Get user by ID
userRouter.get("/:id", authMiddleware, getUserById);

// Update user by ID
userRouter.put("/:id", authMiddleware, updateUser);

// Delete user by ID
userRouter.delete("/:id", authMiddleware, deleteUser);

export default userRouter;
