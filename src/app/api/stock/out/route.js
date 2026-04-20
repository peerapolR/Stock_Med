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

    // 1. ค้นหาสินค้าที่มี SKU ตรงกัน
    const product = await Product.findOne({ "variants.sku": sku });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "ไม่พบสินค้านี้ในระบบ" },
        { status: 404 },
      );
    }

    // 2. ตรวจสอบว่าสต๊อกพอให้ตัดหรือไม่
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant.currentStock < qtyNumber) {
      return NextResponse.json(
        {
          success: false,
          message: `สต๊อกไม่เพียงพอ (คงเหลือ: ${variant.currentStock})`,
        },
        { status: 400 },
      );
    }

    // 3. อัปเดตตัดสต๊อก (ลดจำนวน currentStock ลง)
    await Product.findOneAndUpdate(
      { "variants.sku": sku },
      { $inc: { "variants.$.currentStock": -qtyNumber } },
      { new: true },
    );

    // 4. บันทึกประวัติ (Transaction) สำหรับไปทำ Report
    await Transaction.create({
      type: "OUT",
      sku: sku,
      quantity: qtyNumber,
      performedBy: performedBy || "System", // เดี๋ยวค่อยเปลี่ยนเป็นชื่อ User จากระบบ Login
    });

    return NextResponse.json({
      success: true,
      message: "ตัดสต๊อกเรียบร้อยแล้ว",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
