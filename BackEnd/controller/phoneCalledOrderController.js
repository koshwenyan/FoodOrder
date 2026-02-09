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

export const getPhoneCalledOrdersByCompany = async (req, res) => {
    try {
        if (req.user.role !== "company-admin") {
            return res.status(403).json({
                message: "Only company-admin can view company phone orders",
            });
        }

        if (!req.user.companyId) {
            return res.status(400).json({
                message: "Company not assigned to this admin",
            });
        }

        const orders = await PhoneCalledOrder.find({
            deliveryCompany: req.user.companyId,
        })
            .populate("deliveryCompany", "name phone")
            .populate("items.menu", "name price")
            .populate("createdBy", "name email")
            .populate("deliveryStaff", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const assignPhoneCalledOrderStaff = async (req, res) => {
    try {
        if (req.user.role !== "company-admin") {
            return res.status(403).json({
                message: "Only company-admin can assign staff",
            });
        }

        const { orderId } = req.params;
        const { staffId } = req.body;

        const order = await PhoneCalledOrder.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryCompany?.toString() !== req.user.companyId?.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        order.deliveryStaff = staffId;
        if (order.status === "confirmed") {
            order.status = "assigned";
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order assigned to delivery staff",
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePhoneCalledOrderStatus = async (req, res) => {
    try {
        if (!["company-admin", "company-staff"].includes(req.user.role)) {
            return res.status(403).json({
                message: "Only company-admin or company-staff can update status",
            });
        }

        const { orderId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "confirmed",
            "assigned",
            "picked-up",
            "delivered",
            "complete",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await PhoneCalledOrder.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (req.user.role === "company-admin") {
            if (order.deliveryCompany?.toString() !== req.user.companyId?.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        } else if (req.user.role === "company-staff") {
            if (order.deliveryStaff?.toString() !== req.user._id?.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPhoneCalledOrdersByStaff = async (req, res) => {
    try {
        if (req.user.role !== "company-staff") {
            return res.status(403).json({
                message: "Only delivery staff can access this",
            });
        }

        const orders = await PhoneCalledOrder.find({
            deliveryStaff: req.user._id,
        })
            .populate("deliveryCompany", "name phone")
            .populate("items.menu", "name price")
            .populate("createdBy", "name email")
            .populate("shopId", "name address")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
