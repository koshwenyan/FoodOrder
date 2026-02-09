import mongoose from "mongoose";

const phoneCalledOrderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        deliveryCompany: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryCompany",
            required: true,
        },

        items: [
            {
                menu: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],

        totalItems: {
            type: Number,
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // staff/admin who received the call
        },

        orderType: {
            type: String,
            default: "phone",
            enum: ["phone"],
        },

        status: {
            type: String,
            enum: [
                "confirmed",
                "assigned",
                "picked-up",
                "delivered",
                "complete",
                "cancelled",
            ],
            default: "confirmed",
        },

        deliveryStaff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

const PhoneCalledOrder = mongoose.model(
    "PhoneCalledOrder",
    phoneCalledOrderSchema
);

export default PhoneCalledOrder;
