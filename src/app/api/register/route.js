import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectMongo();
    const { firstName, lastName, role, username, password } = await req.json();

    // เช็คว่ามี Username นี้ในระบบหรือยัง
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Username นี้ถูกใช้งานแล้ว" },
        { status: 400 },
      );
    }

    // เข้ารหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง User ใหม่
    const newUser = await User.create({
      firstName,
      lastName,
      role,
      username,
      password: hashedPassword,
    });

    return NextResponse.json(
      { success: true, message: "ลงทะเบียนสำเร็จ" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
