import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { Transaction } from "@/models";

export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // รูปแบบ YYYY-MM-DD
    const monthParam = searchParams.get("month"); // รูปแบบ YYYY-MM
    const typeParam = searchParams.get("type");

    let matchCondition = {};

    // กรองตามประเภท (IN / OUT)
    if (typeParam && typeParam !== "ALL") {
      matchCondition.type = typeParam;
    }

    // กรองตามวันที่ หรือ เดือน (เลือกอย่างใดอย่างหนึ่ง)
    if (dateParam) {
      // ค้นหารายวัน
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);

      matchCondition.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (monthParam) {
      // ค้นหารายเดือน
      const [year, month] = monthParam.split("-");

      // วันที่ 1 ของเดือน
      const startOfMonth = new Date(year, parseInt(month) - 1, 1);
      // วันสุดท้ายของเดือน (ใช้วิธีเซ็ตวันที่เป็น 0 ของเดือนถัดไป)
      const endOfMonth = new Date(year, parseInt(month), 0, 23, 59, 59, 999);

      matchCondition.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    // ดึงข้อมูลและ Join กับตาราง Products
    const transactions = await Transaction.aggregate([
      { $match: matchCondition },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "sku",
          foreignField: "variants.sku",
          as: "productData",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          sku: 1,
          quantity: 1,
          performedBy: 1,
          date: 1,
          productName: { $arrayElemAt: ["$productData.name", 0] },
        },
      },
    ]);

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
