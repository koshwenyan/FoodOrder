import mongoose from "mongoose";
import PhoneCalledOrder from "../model/phoneCalledOrderModel.js";

export const createPhoneCalledOrder = async (req, res) => {
    try {
        const {
            customerName,
            phone,
            address,
            deliveryCompany,
            items,
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items required" });
        }

        const totalItems = items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalAmount = items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );

        const order = await PhoneCalledOrder.create({
            customerName,
            phone,
            address,
            deliveryCompany,
            items,
            totalItems,
            totalAmount,
            shopId: req.user.shopId,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Phone called order created",
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getPhoneCalledOrderTotalByShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        const orders = await PhoneCalledOrder.find({ shopId })
            .populate("deliveryCompany", "name phone")
            .populate("items.menu", "name price")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        const totalOrders = orders.length;
        // const totalAmount = orders.reduce(
        //     (sum, order) => sum + order.totalAmount,
        //     0
        // );

        res.status(200).json({
            success: true,
            shopId,
            totalOrders,
            // totalAmount,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getPhoneCalledOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await PhoneCalledOrder.findById(id)
            .populate("deliveryCompany", "name phone")
            .populate("items.menu", "name price")
            .populate("createdBy", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Security check (optional but recommended)
        if (order.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
