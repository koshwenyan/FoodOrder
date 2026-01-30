import mongoose from "mongoose";

const deliveryCompanySchema = new mongoose.Schema({
    name: { type: "String", required: true },
    email: { type: "String", required: true, lowercase: true },
    photo: { type: String, required: true },
    serviceFee: { type: Number, required: true },
    staffCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DeliveryCompany = mongoose.model("DeliveryCompany", deliveryCompanySchema);

export default DeliveryCompany;