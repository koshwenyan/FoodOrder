import mongoose from "mongoose";

const categorySchem = new mongoose.Schema({
    name: { type: "String", required: true }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchem);
export default Category;