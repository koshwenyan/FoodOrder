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


// //update order
// export const updateOrderStatusByShop = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { status } = req.body;

//         const allowedStatus = ["accepted", "preparing", "ready"];

//         if (!allowedStatus.includes(status)) {
//             return res.status(400).json({ message: "Invalid status update" });
//         }

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // shop-admin can only update their shop orders
//         if (order.shopId.toString() !== req.user.shopId.toString()) {
//             return res.status(403).json({ message: "Access denied" });
//         }

//         order.status = status;
//         await order.save();

//         res.status(200).json({
//             message: "Order status updated",
//             data: order
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const SHOP_ADMIN_STATUS = [
            "pending",
            "accepted",
            "preparing",
            "ready",
            "delivered",
            "complete"
        ];
        const STAFF_STATUS = ["picked-up", "delivered", "complete"];

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ================= SHOP-ADMIN =================
        if (req.user.role === "shop-admin") {

            if (!SHOP_ADMIN_STATUS.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status for shop-admin"
                });
            }

            // shop-admin can update only their shop orders
            if (!req.user.shopId || order.shopId.toString() !== req.user.shopId.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }

            order.status = status;
            await order.save();

            return res.status(200).json({
                message: "Order status updated by shop-admin",
                data: order
            });
        }

        // ================= DELIVERY STAFF =================
        if (req.user.role === "company-staff") {

            if (!STAFF_STATUS.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status for delivery staff"
                });
            }

            // staff can update only assigned orders
            if (!order.deliveryStaff || order.deliveryStaff.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: "You can update only your assigned orders"
                });
            }

            order.status = status;
            await order.save();

            return res.status(200).json({
                message: "Order status updated by delivery staff",
                data: order
            });
        }

        // ================= OTHERS =================
        return res.status(403).json({
            message: "You are not allowed to update order status"
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ message: "Internal server error" });
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

//view company admin total orders

export const getOrdersByCompany = async (req, res) => {
    try {
        // 🔐 ONLY company-admin
        if (req.user.role !== "company-admin") {
            return res.status(403).json({
                message: "Only company-admin can view company orders"
            });
        }

        // company-admin must belong to a company
        if (!req.user.companyId) {
            return res.status(400).json({
                message: "Company not assigned to this admin"
            });
        }

        const orders = await Order.find({
            deliveryCompany: req.user.companyId
        })
            .populate("customer", "name phone")
            .populate("shopId", "name address")
            .populate("items.menuId", "name price")
            .populate("deliveryStaff", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Get company orders error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

//view staff total orders
// ================= Get orders for delivery staff =================
export const getMyDeliveryOrders = async (req, res) => {
    try {
        // 🔐 Only delivery staff
        if (req.user.role !== "company-staff") {
            return res.status(403).json({ message: "Only delivery staff can access this" });
        }

        const orders = await Order.find({
            deliveryStaff: req.user._id
        })
            .populate("customer", "name phone")
            .populate("shopId", "name address")
            .populate("items.menuId", "name price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Get staff orders error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ============ Delivery company order counts (assigned & delivered) ============


export const getCompanyOrderCounts = async (req, res) => {
    try {
        // 🔐 Only company-admin
        if (req.user.role !== "company-admin") {
            return res.status(403).json({
                success: false,
                message: "Only company-admin can view order counts",
            });
        }

        // 🏢 Must have company
        if (!req.user.companyId) {
            return res.status(400).json({
                success: false,
                message: "Company not assigned to user",
            });
        }

        const companyId = req.user.companyId;

        /* ================= COUNT ================= */

        const assignedCount = await Order.countDocuments({
            deliveryCompany: companyId,
            status: "assigned",
        });

        const pickedUpCount = await Order.countDocuments({
            deliveryCompany: companyId,
            status: "picked-up",
        });

        const deliveredCount = await Order.countDocuments({
            deliveryCompany: companyId,
            status: "delivered",
        });

        /* ================= ORDERS ================= */

        const orders = await Order.find({
            deliveryCompany: companyId,   // 🔥 FIXED
        })
            .populate("customer", "name phone")
            .populate("shopId", "name address")
            .populate("deliveryStaff", "name phone")
            .populate("items.menuId", "name price")
            .sort({ createdAt: -1 });

        /* ================= RESPONSE ================= */

        res.status(200).json({
            success: true,
            counts: {
                assigned: assignedCount,
                pickedUp: pickedUpCount,
                delivered: deliveredCount,
            },
            data: orders,
        });

    } catch (error) {
        console.error("Get company order counts error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// ============ Delivery staff picked-up & delivered orders ============
export const getStaffPickedAndDeliveredOrders = async (req, res) => {
    try {
        // 🔐 Only delivery staff
        if (req.user.role !== "company-staff") {
            return res.status(403).json({
                message: "Only delivery staff can access this"
            });
        }

        const pickedUpOrders = await Order.find({
            deliveryStaff: req.user._id,
            status: "picked-up"
        })
            .populate("customer", "name phone")
            .populate("shopId", "name address")
            .populate("items.menuId", "name price")
            .sort({ createdAt: -1 });

        const deliveredOrders = await Order.find({
            deliveryStaff: req.user._id,
            status: "delivered"
        })
            .populate("customer", "name phone")
            .populate("shopId", "name address")
            .populate("items.menuId", "name price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            staffId: req.user._id,
            totals: {
                pickedUp: pickedUpOrders.length,
                delivered: deliveredOrders.length
            },
            data: {
                pickedUpOrders,
                deliveredOrders
            }
        });

    } catch (error) {
        console.error("Get staff orders error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//get order status by a shop
// ================= Shop order status totals =================
export const getShopOrderStatusTotals = async (req, res) => {
    try {
        // 🔐 Only shop-admin
        if (req.user.role !== "shop-admin") {
            return res.status(403).json({
                message: "Only shop-admin can access this"
            });
        }

        if (!req.user.shopId) {
            return res.status(400).json({
                message: "Shop not assigned to this user"
            });
        }

        const shopId = req.user.shopId;

        const pendingCount = await Order.countDocuments({
            shopId,
            status: "pending"
        });

        const assignedCount = await Order.countDocuments({
            shopId,
            status: "assigned"
        });

        const deliveredCount = await Order.countDocuments({
            shopId,
            status: "delivered"
        });

        res.status(200).json({
            success: true,
            shopId,
            totals: {
                pending: pendingCount,
                assigned: assignedCount,
                delivered: deliveredCount
            }
        });

    } catch (error) {
        console.error("Shop order totals error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
