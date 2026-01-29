import mongoose from "mongoose";
import Order from "../model/orderModel.js";
import Menu from "../model/menuModel.js";
import Shop from "../model/shopModel.js";

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { shopId, items, deliveryAddress } = req.body;

        // Check required fields
        if (!shopId || !items || items.length === 0 || !deliveryAddress) {
            return res.status(400).json({ message: "shopId, items, and deliveryAddress are required." });
        }

        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shopId." });
        }

        // Validate shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ message: "Shop not found." });

        // Ensure each menu item exists and quantity is number
        const orderItems = [];
        let totalAmount = 0;

        for (const i of items) {
            if (!i.menuId || !i.quantity) {
                return res.status(400).json({ message: "Each item must have menuId and quantity." });
            }

            if (!mongoose.Types.ObjectId.isValid(i.menuId)) {
                return res.status(400).json({ message: `Invalid menuId: ${i.menuId}` });
            }

            const menu = await Menu.findById(i.menuId);
            if (!menu) return res.status(404).json({ message: `Menu not found: ${i.menuId}` });

            const quantity = Number(i.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({ message: `Invalid quantity for menu: ${menu.name}` });
            }

            orderItems.push({
                menuId: menu._id,
                quantity
            });

            totalAmount += menu.price * quantity;
        }

        // Create order
        const order = await Order.create({
            customer: req.user._id,       // logged-in user
            shopId,
            items: orderItems,
            deliveryAddress,
            totalAmount,
            status: "pending"             // default status
        });

        res.status(201).json({
            message: "Order created successfully",
            data: order
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


//update order
export const updateOrderStatusByShop = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const allowedStatus = ["accepted", "preparing", "ready"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // shop-admin can only update their shop orders
        if (order.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated",
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//shop-admin assigned delivery-company
export const assignDeliveryCompany = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { companyId } = req.body;

        if (!companyId) {
            return res.status(400).json({ message: "companyId is required" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 🔐 ONLY SHOP-ADMIN CAN ASSIGN DELIVERY COMPANY
        if (req.user.role !== "shop-admin") {
            return res.status(403).json({
                message: "Only shop-admin can assign delivery company"
            });
        }

        // 🔐 shop-admin can assign ONLY their shop orders
        if (order.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(403).json({
                message: "You can only manage your own shop orders"
            });
        }

        order.deliveryCompany = companyId;
        order.status = "assigned";

        await order.save();

        res.status(200).json({
            message: "Delivery company assigned successfully",
            data: order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//company-admin assigned company-staff
export const assignDeliveryStaff = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { staffId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.deliveryStaff = staffId;
        order.status = "picked-up";

        await order.save();

        res.status(200).json({
            message: "Order assigned to delivery staff",
            data: order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Admin can be see All orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customer", "name phone")
            .populate("shopId", "name")
            .populate("deliveryCompany", "name")
            .populate("deliveryStaff", "name");

        res.status(200).json({
            totalOrders: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//admin can be delete orders
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all orders for a specific shop
export const getOrdersByShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        // Validate shopId
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        // Fetch all orders for the shop
        const orders = await Order.find({ shopId })
            .populate("customer", "name phone")
            .populate("items.menuId", "name price")
            .populate("deliveryCompany", "name")
            .populate("deliveryStaff", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Get orders by shop error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//get order customer
// controller/orderController.js

// ================= Get logged-in user's orders =================
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all orders for this customer
        const orders = await Order.find({ customer: userId })
            .populate("shopId", "name address")             // Shop info
            .populate("items.menuId", "name price")        // Menu item info
            .populate("deliveryCompany", "name")           // Delivery company info
            .populate("deliveryStaff", "name email phone") // Delivery staff info
            .sort({ createdAt: -1 });                      // Latest orders first

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ================= Get a specific order for logged-in user =================
export const getMyOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        // Fetch order
        const order = await Order.findOne({ _id: orderId, customer: req.user._id })
            .populate("shopId", "name address")
            .populate("items.menuId", "name price")
            .populate("deliveryCompany", "name")
            .populate("deliveryStaff", "name email phone");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error("Get my order by ID error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
