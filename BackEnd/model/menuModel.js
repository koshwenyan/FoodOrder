import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        description: {
            type: String
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String
        },
        tags: [
            {
                type: String,
                trim: true
            }
        ],
        allergens: [
            {
                type: String,
                trim: true
            }
        ],
        addOns: [
            {
                name: { type: String, trim: true },
                price: { type: Number, default: 0 }
            }
        ],
        isAvailable: {
            type: Boolean,
            default: true
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
