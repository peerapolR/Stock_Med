import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { Product, Transaction } from "@/models";

export async function POST(req) {
  try {
    await connectMongo();

    // ✅ 1. เพิ่ม destination ไว้ในปีกกา เพื่อรับค่าจากฝั่งหน้าเว็บ
    const { sku, quantity, destination, performedBy } = await req.json();

    if (!sku || !quantity) {
      return NextResponse.json(
        { success: false, message: "กรุณาส่งข้อมูล SKU และจำนวนให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const qtyNumber = parseInt(quantity, 10);

    // ค้นหาสินค้า
    const product = await Product.findOne({ "variants.sku": sku });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "ไม่พบสินค้านี้ในระบบ" },
        { status: 404 },
      );
    }

    // เช็คสต๊อกว่าพอให้ตัดหรือไม่
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

    // ✅ 2. แก้ไข Mongoose Warning โดยใช้ returnDocument: 'after' แทน new: true
    await Product.findOneAndUpdate(
      { "variants.sku": sku },
      { $inc: { "variants.$.currentStock": -qtyNumber } },
      { returnDocument: "after" },
    );

    // ✅ 3. บันทึกประวัติและใส่ destination ที่รับมา
    await Transaction.create({
      type: "OUT",
      sku: sku,
      quantity: qtyNumber,
      destination: destination,
      performedBy: performedBy || "System",
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
