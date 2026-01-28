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
userRouter.put("/:id", authMiddleware, updateUser);
userRouter.delete("/:id", authMiddleware, deleteUser);

// Auth
userRouter.post("/login", login);
userRouter.post("/logout", authMiddleware, logout);
userRouter.post("/register", authMiddleware, register);

export default userRouter;
