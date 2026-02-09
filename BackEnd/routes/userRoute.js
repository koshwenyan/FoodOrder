import express from "express";
import {
    register,
    forgotPassword,
    resetPassword,
    login,
    logout,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getLoginUser,
    updateMyLocation,
    walletTopUpMock
} from "../controller/userController.js";

import { authMiddleware, adminMiddleware, protect, optionalAuth } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// 👈 ALWAYS put static routes FIRST
userRouter.get("/me", protect, getLoginUser);
userRouter.put("/location", protect, updateMyLocation);
userRouter.post("/wallet/topup-mock", protect, walletTopUpMock);

// User CRUD
userRouter.get("/all", authMiddleware, adminMiddleware("admin"), getAllUsers);
userRouter.get("/:id", authMiddleware, getUserById);
userRouter.put("/update/:id", authMiddleware, updateUser);
userRouter.delete("/:id", authMiddleware, deleteUser);

// Auth
userRouter.post("/login", login);
userRouter.post("/logout", authMiddleware, logout);
// Public register for customer role; admin/staff roles enforced in controller if token is present
userRouter.post("/register", optionalAuth, register);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
