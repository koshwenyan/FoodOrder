import Category from "../model/categoryModel.js";
import mongoose from "mongoose";

// ================= CREATE CATEGORY =================
export const createCategory = async (req, res) => {
    try {
        const { name, photo } = req.body;

        if (!name || !photo) {
            return res.status(400).json({
                message: "Category name and photo are required"
            });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                message: "Category name already exists"
            });
        }

        const newCategory = await Category.create({ name, photo });

        res.status(201).json({
            message: "Category created successfully",
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ================= GET ALL CATEGORIES =================
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalCategories: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ================= GET CATEGORY BY ID =================
export const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ================= UPDATE CATEGORY =================
export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, photo } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (name) {
            const existingCategory = await Category.findOne({
                name,
                _id: { $ne: categoryId }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category name already exists"
                });
            }

            category.name = name;
        }

        if (photo) {
            category.photo = photo;
        }

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ================= DELETE CATEGORY =================
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
