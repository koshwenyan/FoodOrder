import mongoose from "mongoose";
import DeliveryCompany from "../model/deliveryCompanyModel.js";

export const createCompany = async (req, res) => {
    try {
        const { name, email, serviceFee } = req.body;

        if (!name || !email || !serviceFee) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const existingCompany = await DeliveryCompany.findOne({ email });

        if (existingCompany) {
            return res.status(400).json({ message: "Company already exist" });
        }

        const newCompany = await DeliveryCompany.create(req.body);


        res.status(201).json({ message: "Company created successfully", data: newCompany });

    } catch (error) {
        return res.status(500).json({ message: "Internal server errors" })
    }
}



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
                $addFields: {
                    totalStaff: {
                        $size: {
                            $filter: {
                                input: "$staffs",
                                as: "staff",
                                cond: { $eq: ["$$staff.role", "delivery-staff"] }
                            }
                        }
                    }
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
