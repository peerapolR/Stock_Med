import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { Product } from "@/models";

export async function GET() {
  try {
    await connectMongo();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    const existingProduct = await Product.findOne({ name: body.name });
    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "ชื่อสินค้านี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น",
        },
        { status: 400 },
      );
    }

    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
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
