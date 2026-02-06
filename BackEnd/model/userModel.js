import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: "String", required: true },
    email: { type: "String", required: true, lowcase: true },
    password: {
        type: String,
        required: function () {
            return this.isNew;
        },
    },
    phone: { type: "String", required: true },
    address: { type: "String", required: true },
    role: { type: "String", enum: ["admin", "shop-admin", "company-admin", "company-staff", "customer"], default: "customer" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    companyId: {
        type: mongoose.Schema.Types.ObjectId, ref: "DeliveryCompany",

    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const User = mongoose.model("User", userSchema);

export default User;
