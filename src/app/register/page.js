"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "พนักงานคลังสินค้า",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      alert("ลงทะเบียนสำเร็จ!");
      router.push("/login");
    } else {
      setMessage(data.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนพนักงาน</h1>
          <p className="text-gray-500 text-sm mt-1">
            เพิ่มผู้ใช้งานเข้าสู่ระบบจัดการสต๊อก
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="ชื่อ"
              required
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="นามสกุล"
              required
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

          <select
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black bg-white"
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="พนักงานคลังสินค้า">พนักงานคลังสินค้า</option>
            <option value="ผู้จัดการ">ผู้จัดการ</option>
            <option value="ผู้ดูแลระบบ (Admin)">ผู้ดูแลระบบ (Admin)</option>
          </select>

          <input
            type="text"
            placeholder="Username (สำหรับล็อคอิน)"
            required
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-medium py-3 rounded-xl mt-2 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "ลงทะเบียน"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            มีบัญชีอยู่แล้ว?{" "}
            <a href="/login" className="text-black font-medium underline">
              เข้าสู่ระบบ
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
