import User from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, role, shopId, companyId } = req.body;

        if (!name || !email || !password || !phone || !address || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // role validation
        if (role === "shop-admin" && !shopId) {
            return res.status(400).json({ message: "shopId is required for shop-admin" });
        }

        if ((role === "company-admin" || role === "company-staff") && !companyId) {
            return res.status(400).json({ message: "companyId is required" });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role,
            shopId: role === "shop-admin" ? shopId : null,
            companyId: ["company-admin", "company-staff"].includes(role) ? companyId : null
        });

        res.status(201).json({
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Register failed", error: error.message });
    }
};

// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// ================= LOGOUT =================
// JWT logout is handled on frontend (remove token)
export const logout = async (req, res) => {
    res.status(200).json({ message: "Logout successful (token removed on client)" });
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true
        }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};
