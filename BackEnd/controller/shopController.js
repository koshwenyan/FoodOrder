import Shop from "../model/shopModel.js";
import mongoose from "mongoose";

// ================= CREATE SHOP =================
export const createShop = async (req, res) => {
    try {
        const { name, category, description, address, OpenTime, CloseTime } = req.body;

        if (!name || !category || !description || !address || !OpenTime || !CloseTime) {
            return res.status(400).json({
                message: "Please fill all required fields",
            });
        }

        const existingShop = await Shop.findOne({ name });
        if (existingShop) {
            return res.status(400).json({
                message: "Shop already exists",
            });
        }

        const newShop = await Shop.create({
            name,
            category,
            description,
            address,
            OpenTime,
            CloseTime,

        });

        res.status(201).json({
            message: "Shop created successfully",
            data: newShop,
        });
    } catch (error) {
        console.error("Create shop error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ================= GET ALL SHOPS =================
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find().sort({ createdAt: -1 }).populate("category", "name");

        res.status(200).json({
            success: true,
            totalShops: shops.length,
            data: shops,
        });
    } catch (error) {
        console.error("Get all shops error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ================= GET SHOP BY ID =================
export const getShopById = async (req, res) => {
    try {
        const { shopId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        const shop = await Shop.findById(shopId).populate("category", "name");

        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        res.status(200).json({
            success: true,
            data: shop,
        });
    } catch (error) {
        console.error("Get shop by ID error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ================= UPDATE SHOP =================
export const updateShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { name, category, description, address, OpenTime, CloseTime, isActive, photo } = req.body;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Check if name is changing and already exists
        if (name && name !== shop.name) {
            const existingShop = await Shop.findOne({ name, _id: { $ne: shopId } });
            if (existingShop) {
                return res.status(400).json({ message: "Shop name already exists" });
            }
            shop.name = name;
        }

        shop.category = category || shop.category;
        shop.description = description || shop.description;
        shop.address = address || shop.address;
        shop.OpenTime = OpenTime || shop.OpenTime;
        shop.CloseTime = CloseTime || shop.CloseTime;
        shop.isActive = isActive ?? shop.isActive;
        shop.photo = photo || shop.photo;

        await shop.save();

        res.status(200).json({
            message: "Shop updated successfully",
            data: shop,
        });
    } catch (error) {
        console.error("Update shop error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ================= DELETE SHOP =================
export const deleteShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        const shop = await Shop.findByIdAndDelete(shopId);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        res.status(200).json({
            message: "Shop deleted successfully",
        });
    } catch (error) {
        console.error("Delete shop error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
