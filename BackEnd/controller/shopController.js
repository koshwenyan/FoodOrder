
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
                    isActive: 1,
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

//getbyshopId
export const getShopById = async (req, res) => {
    try {
        const { shopId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({
                message: "Invalid shop ID",
                success: false
            });
        }

        const shop = await Shop.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(shopId) }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            }
        ]);

        if (!shop.length) {
            return res.status(404).json({
                message: "Shop not found",
                success: false
            });
        }

        res.status(200).json({
            success: true,
            data: shop[0]
        });

    } catch (error) {
        console.error("Get shop by ID error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

//getallshop
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: shops.length,
            data: shops
        });

    } catch (error) {
        console.error("Get all shops error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

//updateshop
export const updateShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { name, category, description, address, OpenTime, CloseTime, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({
                message: "Invalid shop ID",
                success: false
            });
        }

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                success: false
            });
        }

        shop.name = name || shop.name;
        shop.category = category || shop.category;
        shop.description = description || shop.description;
        shop.address = address || shop.address;
        shop.OpenTime = OpenTime || shop.OpenTime;
        shop.CloseTime = CloseTime || shop.CloseTime;
        shop.isActive = isActive ?? shop.isActive;

        await shop.save();

        res.status(200).json({
            message: "Shop updated successfully",
            success: true,
            data: shop
        });

    } catch (error) {
        console.error("Update shop error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

//delete shop
export const deleteShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({
                message: "Invalid shop ID",
                success: false
            });
        }

        const shop = await Shop.findByIdAndDelete(shopId);

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Shop deleted successfully",
            success: true
        });

    } catch (error) {
        console.error("Delete shop error:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
