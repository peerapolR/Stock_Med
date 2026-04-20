import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { Product } from "@/models";

// ดึงรายการสินค้าทั้งหมด (Module 2)
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

// สร้างสินค้าใหม่ (Module 1)
export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
