import mongoose from "mongoose";

// 1. User Schema (พนักงาน)
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ในของจริงควร Hash ด้วย bcrypt
  },
  { timestamps: true },
);

// 2. Product Schema (สินค้าและ Variant)
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    variants: [
      {
        sku: { type: String, required: true, unique: true },
        size: { type: String },
        weight: { type: String },
        type: { type: String },

        currentStock: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

// 3. Transaction Schema (ประวัติการเข้า-ออกของสต๊อก สำหรับออก Report)
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["IN", "OUT"], required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  destination: { type: String },
  performedBy: { type: String, required: true }, // ชื่อคนทำรายการ
  date: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
