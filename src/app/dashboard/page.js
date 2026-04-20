"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  AlertCircle,
  BarChart3,
  ScanLine,
  PlusCircle,
  Printer,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  PackagePlus,
  Newspaper,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. ดึงข้อมูลสินค้ามาคำนวณสถิติ
        const prodRes = await fetch("/api/products");
        const prodData = await prodRes.json();

        let totalStockCount = 0;
        let lowStockCount = 0;

        if (prodData.success) {
          prodData.data.forEach((product) => {
            product.variants.forEach((variant) => {
              totalStockCount += variant.currentStock;
              if (variant.currentStock < 10) lowStockCount++; // ตั้งค่าแจ้งเตือนถ้าน้อยกว่า 10 ชิ้น
            });
          });
          setStats({
            totalProducts: prodData.data.length,
            totalStock: totalStockCount,
            lowStock: lowStockCount,
          });
        }

        // 2. ดึงข้อมูลประวัติรายการล่าสุด (เอาแค่ 5 รายการแรก)
        const transRes = await fetch("/api/reports");
        const transData = await transRes.json();

        if (transData.success) {
          setRecentTransactions(transData.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [status]);

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  // if (loading)
  //   return (
  //     <div className="flex justify-center items-center min-h-[60vh]">
  //       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
  //     </div>
  //   );

  if (status === "loading") {
    return <div>กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center mt-20">กำลังเปลี่ยนหน้าไปเข้าสู่ระบบ...</div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ภาพรวมระบบคลังสินค้า
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ยินดีต้อนรับ,{" "}
            <span className="font-bold text-black">{session?.user?.name}</span>{" "}
            ({session?.user?.role})
          </p>
        </div>

        {/* ปุ่ม Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            ภาพรวมระบบคลังสินค้า
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ยินดีต้อนรับ, นี่คือสรุปข้อมูลสต๊อกของคุณในวันนี้
          </p>
        </div>

        {/* 1. Stat Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            variants={item}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                รายการสินค้า (SKU หลัก)
              </p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalProducts}{" "}
                <span className="text-sm font-normal text-gray-500">
                  รายการ
                </span>
              </h3>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                จำนวนชิ้นในคลังทั้งหมด
              </p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalStock.toLocaleString()}{" "}
                <span className="text-sm font-normal text-gray-500">ชิ้น</span>
              </h3>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-500">
                สินค้าใกล้หมด (ต่ำกว่า 10)
              </p>
              <h3 className="text-2xl font-bold text-red-600">
                {stats.lowStock}{" "}
                <span className="text-sm font-normal text-red-400">รายการ</span>
              </h3>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2. เมนูลัด (Quick Actions) */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">เมนู</h2>

            <Link href="/dashboard/scan">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className=" bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-black transition mb-4"
              >
                <div className="flex items-center gap-3">
                  <ScanLine className="w-6 h-6" />
                  <span className="font-medium">สแกนตัดสต๊อก / เบิกสินค้า</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-800" />
              </motion.div>
            </Link>

            <Link href="/dashboard/restock">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className=" bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-black transition mb-4"
              >
                <div className="flex items-center gap-3">
                  <PackagePlus className="w-6 h-6" />
                  <span className="font-medium">เพิ่มสต๊อก</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-800" />
              </motion.div>
            </Link>

            <Link href="/dashboard/products">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-black transition mb-4"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Package className="w-6 h-6" />
                  <span className="font-medium">สินค้าทั้งหมด</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-800" />
              </motion.div>
            </Link>

            <Link href="/dashboard/export">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-black transition mb-4"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Printer className="w-6 h-6" />
                  <span className="font-medium">พิมพ์ QR Code สินค้า</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-800" />
              </motion.div>
            </Link>

            <Link href="/dashboard/reports">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-black transition"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Newspaper className="w-6 h-6" />
                  <span className="font-medium">รายงาน</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-800" />
              </motion.div>
            </Link>
          </div>

          {/* 3. ประวัติล่าสุด (Recent Transactions) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                ความเคลื่อนไหวล่าสุด
              </h2>
              <Link
                href="/dashboard/reports"
                className="text-sm text-blue-600 hover:underline"
              >
                ดูทั้งหมด
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  ยังไม่มีประวัติการทำรายการ
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentTransactions.map((tx, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={tx._id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "IN" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                        >
                          {tx.type === "IN" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {tx.sku}{" "}
                            <span className="font-normal text-gray-500">
                              - {tx.productName || "ไม่ทราบชื่อ"}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(tx.date).toLocaleString("th-TH")} • โดย{" "}
                            {tx.performedBy}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-right font-bold ${tx.type === "IN" ? "text-green-600" : "text-red-600"}`}
                      >
                        {tx.type === "IN" ? "+" : "-"}
                        {tx.quantity}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
