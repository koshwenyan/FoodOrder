import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },

        items: [
            {
                menuId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true
                },
                name: String,
                price: Number,
                quantity: Number,
                addOns: [
                    {
                        name: String,
                        price: Number
                    }
                ],
                note: String,
                addOnsTotal: Number,
                lineTotal: Number
            }
        ],

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",        // customer placed
                "accepted",       // shop accepted
                "preparing",
                "ready",
                "assigned",       // admin → delivery company
                "picked-up",      // delivery staff
                "delivered",
                "complete",
                "cancelled"
            ],
            default: "pending"
        },

        deliveryCompany: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryCompany",
            default: null
        },

        deliveryStaff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        deliveryAddress: String,

        isPaid: {
            type: Boolean,
            default: false
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "wallet", "kpay"],
            default: "cash"
        },
        paymentReference: {
            type: String
        },
        paidAt: {
            type: Date
        },
        walletAmount: {
            type: Number,
            default: 0
        },
        walletDeductedAt: {
            type: Date
        },
        walletRefundedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
