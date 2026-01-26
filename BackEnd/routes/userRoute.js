import express from "express";
import {
    register,
    login,
    logout,
    updateUser,
    deleteUser
} from "../controller/userController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Public
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);

// Protected
userRouter.put("/update/:id", authMiddleware, updateUser);

// Admin only
userRouter.delete(
    "/delete/:id",
    authMiddleware,
    adminMiddleware("admin"),
    deleteUser
);

export default userRouter;
