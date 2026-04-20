"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import QRScanner from "@/components/QRScanner";

import { ArrowLeft } from "lucide-react";

export default function ScanToDeductPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [scannedSku, setScannedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // เมื่อสแกนสำเร็จ
  const handleScanSuccess = (sku) => {
    // มีเสียง Beep เล็กๆ (ถ้าต้องการ)
    setScannedSku(sku);
    setMessage({ text: "", type: "" });
  };

  // กดยืนยันตัดสต๊อก
  const handleDeductStock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stock/out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: scannedSku,
          quantity,
          performedBy: session?.user?.name || "Admin",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: "✅ ตัดสต๊อกสำเร็จ!", type: "success" });
        setTimeout(() => resetScanner(), 2000); // กลับไปหน้าสแกนหลัง 2 วินาที
      } else {
        setMessage({ text: `❌ ${data.message}`, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    }
    setLoading(false);
  };

  const resetScanner = () => {
    setScannedSku(null);
    setQuantity(1);
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen flex flex-col items-center">
      <div className="flex mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          สแกนตัดสต๊อก (นำออก)
        </h1>
      </div>

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {!scannedSku ? (
            // โหมด: กล้องสแกน
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <QRScanner onScanSuccess={handleScanSuccess} />
            </motion.div>
          ) : (
            // โหมด: กรอกจำนวน
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 w-full max-w-sm mx-auto"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">
                  รหัสสินค้า (SKU) ที่สแกนได้
                </p>
                <p className="text-xl font-mono font-bold text-blue-600 bg-blue-50 py-2 rounded-lg">
                  {scannedSku}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนที่ต้องการเบิก/ขาย
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="flex-1 h-12 text-center text-xl font-bold border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeductStock}
                  disabled={loading || message.type === "success"}
                  className="flex-1 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "กำลังบันทึก..." : "ยืนยันตัดสต๊อก"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
