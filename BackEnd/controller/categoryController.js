import Category from "../model/categoryModel.js";

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Please fill category name" });
        }

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({ message: "Category name is already exist" });
        }

        const newCategory = await Category.create(req.body);

        res.status(201).json({ message: "Category created successfully", data: newCategory })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}