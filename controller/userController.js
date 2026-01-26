import User from "../model/userModel.js";
import Shop from "../model/shopModel.js";
import DeliveryCompany from "../model/deliveryCompanyModel.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            role,
            shopId,
            companyId
        } = req.body;


        if (!name || !email || !password || !phone || !address || !role) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }


        if (role === "shop-admin" && !shopId) {
            return res.status(400).json({ message: "shopId is required for shop-admin" });
        }
        if ((role === "company-admin" || role === "delivery-staff") && !companyId) {
            return res.status(400).json({ message: "companyId is required for company-admin or delivery-staff" });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }


        const hashPassword = await bcrypt.hash(password, 10);


        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            phone,
            address,
            role,
            shopId: role === "shop-admin" ? shopId : null,
            companyId: (role === "company-admin" || role === "company-staff") ? companyId : null
        });

        if (role === "company-staff") {
            await DeliveryCompany.findByIdAndUpdate(
                companyId,
                { $inc: { staffCount: 1 } },
                { new: true }
            );
        }


        const populatedUser = await User.findById(newUser._id)
            .select("-password")
            .populate("shopId", "name")
            .populate("companyId", "name");


        res.status(201).json({
            message: "User created successfully",
            data: populatedUser
        });

    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const result = await User.aggregate([
            {
                $facet: {
                    users: [
                        {
                            $unset: "password"
                        }
                    ],
                    totalCount: [
                        {
                            $count: "count"
                        }
                    ]
                }
            }
        ]);

        res.status(200).json({
            totalUsers: result[0].totalCount[0]?.count || 0,
            users: result[0].users
        });

    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
