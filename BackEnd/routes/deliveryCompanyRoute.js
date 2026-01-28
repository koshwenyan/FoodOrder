import express from "express";
import {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getCompanyWithStaff
} from "../controller/deliveryCompanyController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const companyRouter = express.Router();

// ================= ROUTES =================

// GET all companies - only admin can access
companyRouter.get("/", authMiddleware, adminMiddleware("admin"), getAllCompanies);

// GET single company by ID - only admin can access
companyRouter.get("/:companyId", authMiddleware, adminMiddleware("admin"), getCompanyById);

// CREATE a new company - only admin can access
companyRouter.post("/create", authMiddleware, adminMiddleware("admin"), createCompany);

// UPDATE a company - only admin can access
companyRouter.put("/:companyId", authMiddleware, adminMiddleware("admin"), updateCompany);

// DELETE a company - only admin can access
companyRouter.delete("/:companyId", authMiddleware, adminMiddleware("admin"), deleteCompany);

// GET company with its delivery staff - admin & company-admin can access
companyRouter.get("/:companyId/staffs", authMiddleware, adminMiddleware("admin", "company-admin"), getCompanyWithStaff);

export default companyRouter;
