// import Shop from "../model/shopModel.js";

// export const createShop = async (req, res) => {
//     try {
//         const { name, category, description, address, OpenTime, CloseTime } = req.body;

//         // 1️⃣ Validation
//         if (!name || !category || !description || !address || !OpenTime || !CloseTime) {
//             return res.status(400).json({
//                 message: "Please fill all required fields",
//                 success: false
//             });
//         }

//         // 2️⃣ Check existing shop
//         const existingShop = await Shop.findOne({ name });
//         if (existingShop) {
//             return res.status(400).json({
//                 message: "Shop already exists",
//                 success: false
//             });
//         }

//         // 3️⃣ Create shop
//         const newShop = await Shop.create({
//             name,
//             category,
//             description,
//             address,
//             OpenTime,
//             CloseTime
//         });

//         // 4️⃣ Populate category name
//         const populatedShop = await Shop.findById(newShop._id)
//             .populate("category", "name");

//         // 5️⃣ Response
//         res.status(201).json({
//             message: "Shop created successfully",
//             data: populatedShop,
//             success: true
//         });

//     } catch (error) {
//         console.error("Create shop error:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             success: false
//         });
//     }
// };

import Shop from "../model/shopModel.js";
import mongoose from "mongoose";

export const createShop = async (req, res) => {
    try {
        const { name, category, description, address, OpenTime, CloseTime } = req.body;


        if (!name || !category || !description || !address || !OpenTime || !CloseTime) {
            return res.status(400).json({
                message: "Please fill all required fields",
                success: false
            });
        }


        const existingShop = await Shop.findOne({ name });
        if (existingShop) {
            return res.status(400).json({
                message: "Shop already exists",
                success: false
            });
        }


        const newShop = await Shop.create({
            name,
            category,
            description,
            address,
            OpenTime,
            CloseTime
        });


        const shopWithCategory = await Shop.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(newShop._id) }
            },
            {
                $lookup: {
                    from: "categories",          // collection name
                    localField: "category",      // Shop.category
                    foreignField: "_id",          // Category._id
                    as: "category"
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    address: 1,
                    OpenTime: 1,
                    CloseTime: 1,
                    category: {
                        _id: 1,
                        name: 1
                    },
                    createdAt: 1
                }
            }
        ]);

        res.status(201).json({
            message: "Shop created successfully",
            success: true,
            data: shopWithCategory[0]
        });

    } catch (error) {
        console.error("Create shop error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
