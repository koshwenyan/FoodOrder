import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    photo: { type: String, required: true },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }],
    description: { type: String, required: true },
    address: { type: String, required: true },
    OpenTime: { type: String, required: true },
    CloseTime: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
