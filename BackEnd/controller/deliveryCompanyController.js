import mongoose from "mongoose";
import DeliveryCompany from "../model/deliveryCompanyModel.js";

// ================= CREATE COMPANY =================
export const createCompany = async (req, res) => {
    try {
        const { name, email, serviceFee, photo } = req.body;

        if (!name || !email || !serviceFee || !photo) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const existingCompany = await DeliveryCompany.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ message: "Company already exists" });
        }

        const newCompany = await DeliveryCompany.create(req.body);

        res.status(201).json({ message: "Company created successfully", data: newCompany });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ================= GET ALL COMPANIES =================
export const getAllCompanies = async (req, res) => {
    try {
        // Fetch all companies sorted by creation date
        const companies = await DeliveryCompany.find().sort({ createdAt: -1 });

        // Count total companies
        const totalCompanies = await DeliveryCompany.countDocuments();

        res.status(200).json({
            message: "All companies retrieved",
            totalCompanies,  // <-- total count
            data: companies
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ================= GET COMPANY BY ID =================
export const getCompanyById = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Invalid company ID" });
        }

        const company = await DeliveryCompany.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ message: "Company retrieved", data: company });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ================= UPDATE COMPANY =================
export const updateCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Invalid company ID" });
        }

        const updatedCompany = await DeliveryCompany.findByIdAndUpdate(companyId, updates, { new: true });
        if (!updatedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ message: "Company updated successfully", data: updatedCompany });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ================= DELETE COMPANY =================
export const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Invalid company ID" });
        }

        const deletedCompany = await DeliveryCompany.findByIdAndDelete(companyId);
        if (!deletedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



export const getCompanyWithStaff = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Invalid company ID" });
        }

        const company = await DeliveryCompany.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(companyId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "companyId",
                    as: "staffs"
                }
            },
            {
                // ✅ KEEP ONLY company-staff
                $addFields: {
                    staffs: {
                        $filter: {
                            input: "$staffs",
                            as: "staff",
                            cond: { $eq: ["$$staff.role", "company-staff"] }
                        }
                    }
                }
            },
            {
                // ✅ COUNT ONLY company-staff
                $addFields: {
                    totalStaff: { $size: "$staffs" }
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    serviceFee: 1,
                    staffCount: 1,
                    totalStaff: 1,
                    staffs: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        phone: 1
                    }
                }
            }
        ]);

        if (!company.length) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({
            message: "Company with staff",
            data: company[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
