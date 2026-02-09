import User from "../model/userModel.js";
import DeliveryCompany from "../model/deliveryCompanyModel.js"; // <-- your company model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, role, shopId, companyId } =
            req.body;

        if (!name || !email || !password || !phone || !address || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ================= ROLE PERMISSION CHECK =================
        if (
            ["admin", "company-admin", "company-staff", "shop-admin"].includes(role)
        ) {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "Authentication required to create this role" });
            }
        }

        if (
            role === "company-staff" &&
            !["admin", "company-admin"].includes(req.user.role)
        ) {
            return res
                .status(403)
                .json({
                    message: "Only admin or company-admin can create company-staff",
                });
        }

        if (role === "company-admin" && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Only admin can create company-admin" });
        }

        if (role === "shop-admin" && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Only admin can create shop-admin" });
        }

        // ================= ROLE DATA VALIDATION =================
        if (role === "shop-admin" && !shopId) {
            return res
                .status(400)
                .json({ message: "shopId is required for shop-admin" });
        }

        if (["company-admin", "company-staff"].includes(role) && !companyId) {
            return res.status(400).json({ message: "companyId is required" });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role,
            shopId: role === "shop-admin" ? shopId : null,
            companyId: ["company-admin", "company-staff"].includes(role)
                ? companyId
                : null,
        });

        // ================= INCREMENT STAFF COUNT IF COMPANY-STAFF =================
        if (role === "company-staff") {
            await DeliveryCompany.findByIdAndUpdate(
                companyId,
                { $inc: { staffCount: 1 } },
                { new: true },
            );
        }

        // ================= POPULATE USER =================
        const populatedUser = await User.findById(newUser._id)
            .select("-password")
            .populate("shopId", "name")
            .populate("companyId", "name");

        // ================= COUNT TOTAL COMPANY-STAFF =================
        // const totalCompanyStaff = await User.countDocuments({ role: "company-staff" });

        res.status(201).json({
            message: "User registered successfully",
            // totalCompanyStaff,
            data: populatedUser,
        });
    } catch (error) {
        res.status(500).json({ message: "Register failed", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }, // token valid for 7 days
        );

        // Return user data (without password) and token
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopId: user.shopId,
                companyId: user.companyId,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        // Client should delete token on logout
        res.status(200).json({
            message: "Logout successful. Please remove the token from the client.",
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const rawToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // No email service yet; return token to use in reset step
    res.status(200).json({
      message: "Reset token generated",
      resetToken: rawToken,
      expiresInMinutes: 15,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Forgot password failed", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Reset password failed", error: error.message });
  }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = { ...req.body };

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ===== Permission =====
        if (
            userToUpdate.role === "company-staff" &&
            !["admin", "company-admin"].includes(req.user.role)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only admin or company-admin can update company-staff",
            });
        }

        // ===== Hash password =====
        if (updates.password) {
            updates.password = await bcrypt.hash(
                updates.password,
                10
            );
        }

        // ===== Normalize ONLY if provided =====
        if ("companyId" in updates) {
            updates.companyId =
                updates.companyId && updates.companyId !== ""
                    ? updates.companyId
                    : null;
        }

        if ("shopId" in updates) {
            updates.shopId =
                updates.shopId && updates.shopId !== ""
                    ? updates.shopId
                    : null;
        }

        // ===== Update =====
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        )
            .select("-password")
            .populate("companyId", "name")
            .populate("shopId", "name");

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    }
};


// export const deleteUser = async (req, res) => {
//     try {
//         const userToDelete = await User.findById(req.params.id);
//         if (!userToDelete)
//             return res.status(404).json({ message: "User not found" });

//         // ================= COMPANY-STAFF PERMISSION CHECK =================
//         if (
//             userToDelete.role === "company-staff" &&
//             !["admin", "company-admin"].includes(req.user.role)
//         ) {
//             return res
//                 .status(403)
//                 .json({
//                     message: "Only admin or company-admin can delete company-staff",
//                 });
//         }

//         await User.findByIdAndDelete(req.params.id);
//         if (role === "company-staff") {
//             await DeliveryCompany.findByIdAndUpdate(
//                 companyId,
//                 { $inc: { staffCount: -1 } },
//                 { new: true },
//             );
//         }

//         res.status(200).json({ message: "User deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Delete failed", error: error.message });
//     }
// };

//import DeliveryCompany from "../model/deliveryCompanyModel.js";

export const deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // ================= PERMISSION CHECK =================
        if (
            userToDelete.role === "company-staff" &&
            !["admin", "company-admin"].includes(req.user.role)
        ) {
            return res.status(403).json({
                message: "Only admin or company-admin can delete company-staff",
            });
        }

        // Store role & companyId BEFORE delete
        const role = userToDelete.role;
        const companyId = userToDelete.companyId;

        // ================= DELETE USER =================
        await User.findByIdAndDelete(req.params.id);

        // ================= UPDATE STAFF COUNT =================
        if (role === "company-staff" && companyId) {
            await DeliveryCompany.findByIdAndUpdate(
                companyId,
                { $inc: { staffCount: -1 } },
                { new: true }
            );
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: "Delete failed",
            error: error.message,
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId)
            .select("-password")
            .populate("shopId", "name")
            .populate("companyId", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ================= COMPANY-STAFF PERMISSION CHECK =================
        // Only admin or company-admin can view company-staff
        if (
            user.role === "company-staff" &&
            !["admin", "company-admin"].includes(req.user.role)
        ) {
            return res.status(403).json({
                message: "Only admin or company-admin can view company-staff",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get user by ID error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        // 🔐 Admin only
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        // 📄 Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const skip = (page - 1) * limit;

        // 🔍 Search by name or email
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        // 👥 Get users
        const users = await User.find(keyword)
            .select("-password")
            .populate("shopId", "name")
            .populate("companyId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 🔢 Count users
        const totalUsers = await User.countDocuments(keyword);

        res.status(200).json({
            success: true,
            totalUsers,
            page,
            pages: Math.ceil(totalUsers / limit),
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//get login user data
export const getLoginUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("shopId", "name")
            .populate("companyId", "name");

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                phone: user.phone,
                shopId: user.shopId,
                companyId: user.companyId,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get logged in user",
            error: error.message,
        });
    }
};

// update delivery staff live location
export const updateMyLocation = async (req, res) => {
    try {
        if (req.user.role !== "company-staff") {
            return res.status(403).json({ message: "Only delivery staff can update location" });
        }

        const { lat, lng } = req.body;
        const latitude = Number(lat);
        const longitude = Number(lng);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return res.status(400).json({ message: "lat and lng are required" });
        }

        req.user.lastLocation = {
            lat: latitude,
            lng: longitude,
            updatedAt: new Date()
        };
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Location updated",
            data: req.user.lastLocation
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update location",
            error: error.message
        });
    }
};
