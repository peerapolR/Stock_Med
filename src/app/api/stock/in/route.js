import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { Product, Transaction } from "@/models";

export async function POST(req) {
  try {
    await connectMongo();
    const { sku, quantity, performedBy } = await req.json();

    if (!sku || !quantity) {
      return NextResponse.json(
        { success: false, message: "กรุณาส่งข้อมูล SKU และจำนวนให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const qtyNumber = parseInt(quantity, 10);
    if (qtyNumber <= 0) {
      return NextResponse.json(
        { success: false, message: "จำนวนที่เติมต้องมากกว่า 0" },
        { status: 400 },
      );
    }

    // 1. ค้นหาสินค้า
    const product = await Product.findOne({ "variants.sku": sku });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "ไม่พบสินค้านี้ในระบบ" },
        { status: 404 },
      );
    }

    // 2. อัปเดตเพิ่มสต๊อก (ใช้ $inc เป็นค่าบวก)
    await Product.findOneAndUpdate(
      { "variants.sku": sku },
      { $inc: { "variants.$.currentStock": qtyNumber } },
      { new: true }, // ให้ return ค่าอัปเดตล่าสุดกลับมา
    );

    // 3. บันทึกประวัติ (Transaction) เป็น 'IN'
    await Transaction.create({
      type: "IN",
      sku: sku,
      quantity: qtyNumber,
      performedBy: performedBy || "System",
    });

    return NextResponse.json({
      success: true,
      message: "เติมสต๊อกเรียบร้อยแล้ว",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
