import express from "express";
import {
    register,
    login,
    logout,
    updateUser,
    deleteUser, getAllUsers
} from "../controller/userController.js";

import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();


userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);


userRouter.put("/update/:id", authMiddleware, updateUser);


userRouter.delete(
    "/delete/:id",
    authMiddleware,
    adminMiddleware("admin"),
    deleteUser
);

userRouter.get(
    "/all",
    authMiddleware,
    adminMiddleware("admin"),
    getAllUsers
);

export default userRouter;
