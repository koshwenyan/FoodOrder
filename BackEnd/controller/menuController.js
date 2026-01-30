import Menu from "../model/menuModel.js";
import mongoose from "mongoose";

export const createMenu = async (req, res) => {
    try {
        if (req.user.role !== "shop-admin") {
            return res.status(403).json({ message: "Only shop-admin can create menu items" });
        }

        const { name, category, price, description, image } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        const existingMenu = await Menu.findOne({ name });
        if (existingMenu) {
            return res.status(400).json({ message: "Menu is already exist" })
        }

        const menu = await Menu.create({
            name,
            category,
            price,
            description,
            image,
            shopId: req.user.shopId, // 🔥 auto from shop-admin
            createdBy: req.user._id
        });

        res.status(201).json({
            message: "Menu item created successfully",
            data: menu
        });

    } catch (error) {
        res.status(500).json({ message: "Create menu failed", error: error.message });
    }
};

//update menu

export const updateMenu = async (req, res) => {
    try {
        if (req.user.role !== "shop-admin") {
            return res.status(403).json({ message: "Only shop-admin can update menu" });
        }

        const menu = await Menu.findById(req.params.id);

        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        // 🔐 ensure shop-admin owns this menu
        if (menu.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(403).json({ message: "You can update only your shop menu" });
        }

        const updatedMenu = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Menu updated successfully",
            data: updatedMenu
        });

    } catch (error) {
        res.status(500).json({ message: "Update menu failed", error: error.message });
    }
};

//delete menu

export const deleteMenu = async (req, res) => {
    try {
        if (req.user.role !== "shop-admin") {
            return res.status(403).json({ message: "Only shop-admin can delete menu" });
        }

        const menu = await Menu.findById(req.params.id);

        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        if (menu.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(403).json({ message: "You can delete only your shop menu" });
        }

        await menu.deleteOne();

        res.status(200).json({ message: "Menu deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Delete menu failed", error: error.message });
    }
};

//getall menu

export const getAllMenus = async (req, res) => {
    try {
        const { shopId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        const menus = await Menu.aggregate([
            {
                $match: {
                    shopId: new mongoose.Types.ObjectId(shopId),
                    isAvailable: true
                }
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "shopId",
                    foreignField: "_id",
                    as: "shop"
                }
            },
            { $unwind: "$shop" },
            {
                $project: {
                    name: 1,
                    price: 1,
                    description: 1,
                    image: 1,
                    isAvailable: 1,
                    createdAt: 1,
                    shop: {
                        _id: "$shop._id",
                        name: "$shop.name"
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            totalMenus: menus.length,
            data: menus
        });

    } catch (error) {
        res.status(500).json({ message: "Get menus failed", error: error.message });
    }
};


//getbyid

export const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        // validate menu id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid menu ID"
            });
        }

        const menu = await Menu.findById(id)
            .populate("shopId", "name"); // 👈 show shop name

        if (!menu) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        res.status(200).json({
            success: true,
            data: menu
        });

    } catch (error) {
        console.error("Get menu by ID error:", error);
        res.status(500).json({
            message: "Get menu failed",
            error: error.message
        });
    }
};
