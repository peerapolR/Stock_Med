import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { Product } from "@/models";

export async function GET(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json(
        { success: false, message: "ไม่พบสินค้า" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// อัปเดตข้อมูลสินค้า
export async function PUT(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params;
    const body = await req.json();

    const existingProduct = await Product.findOne({
      name: body.name,
      _id: { $ne: id },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "ชื่อสินค้านี้ถูกใช้งานโดยสินค้าอื่นแล้ว กรุณาใช้ชื่ออื่น",
        },
        { status: 400 },
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        category: body.category,
        variants: body.variants,
      },
      { new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "มีรหัส SKU บางรายการซ้ำกับในระบบแล้ว" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
