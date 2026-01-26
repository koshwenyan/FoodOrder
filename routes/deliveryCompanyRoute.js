import express from "express";
import {
    createCompany,
    getCompanyWithStaff
} from "../controller/deliveryCompanyController.js";

const router = express.Router();

router.post("/create", createCompany);
router.get("/:companyId/staffs", getCompanyWithStaff);

export default router;
