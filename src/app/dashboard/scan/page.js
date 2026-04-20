"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import QRScanner from "@/components/QRScanner";
import { Search, QrCode, ScanLine, ArrowLeft, House } from "lucide-react";

export default function ScanToDeductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [inputMode, setInputMode] = useState("scan");
  const [destination, setDestination] = useState("บ้านแดง");

  const [scannedSku, setScannedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [variants, setVariants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          const flattened = [];
          data.data.forEach((product) => {
            product.variants.forEach((variant) => {
              flattened.push({
                productName: product.name,
                sku: variant.sku,
                details: `${variant.weight} (${variant.type})`,
                currentStock: variant.currentStock,
              });
            });
          });
          setVariants(flattened);
        }
      } catch (error) {
        console.error("Failed to fetch products for search", error);
      }
    };
    fetchProducts();
  }, []);

  const filteredVariants = variants.filter(
    (v) =>
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ✨ ค้นหาข้อมูลสินค้าที่ถูกเลือก เพื่อเอาไปแสดงชื่อและสต๊อก
  const selectedProductDetail = variants.find((v) => v.sku === scannedSku);

  const handleSelectProduct = (sku) => {
    setScannedSku(sku);
    setMessage({ text: "", type: "" });
  };

  const handleDeductStock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stock/out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: scannedSku,
          quantity,
          destination,
          performedBy: session?.user?.name || "พนักงาน",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: "✅ ตัดสต๊อกสำเร็จ!", type: "success" });
        // อัปเดตสต๊อกในหน้าเว็บทันที ไม่ต้องรอโหลดใหม่
        setVariants((prev) =>
          prev.map((v) =>
            v.sku === scannedSku
              ? { ...v, currentStock: v.currentStock - quantity }
              : v,
          ),
        );
        setTimeout(() => resetScanner(), 2000);
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
    setSearchQuery("");
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen flex flex-col items-center">
      <div className="w-full mb-6 flex gap-5">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer flex mb-6"
        >
          <House className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ScanLine className="w-6 h-6" /> สแกนตัดสต๊อก (นำออก)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            สแกน QR Code หรือค้นหาชื่อสินค้าเพื่อตัดยอดขาย
          </p>
        </div>
      </div>

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {!scannedSku ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 w-full">
                <button
                  onClick={() => setInputMode("scan")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${inputMode === "scan" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
                >
                  <QrCode className="w-4 h-4" /> สแกน QR Code
                </button>
                <button
                  onClick={() => setInputMode("search")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${inputMode === "search" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
                >
                  <Search className="w-4 h-4" /> ค้นหารายการ
                </button>
              </div>

              {inputMode === "scan" ? (
                <QRScanner onScanSuccess={handleSelectProduct} />
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="relative mb-4">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="พิมพ์ชื่อสินค้า หรือ SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto border border-gray-50 rounded-xl">
                    {filteredVariants.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-400">
                        ไม่พบรายการสินค้า
                      </div>
                    ) : (
                      filteredVariants.map((v) => (
                        <button
                          key={v.sku}
                          onClick={() => handleSelectProduct(v.sku)}
                          className="w-full text-left flex items-center justify-between p-3 border-b border-gray-50 hover:bg-gray-50 transition"
                        >
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {v.sku}
                            </p>
                            <p className="text-xs text-gray-500">
                              {v.productName} - {v.details}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400">สต๊อก</p>
                            <p
                              className={`text-sm font-bold ${v.currentStock < 10 ? "text-red-500" : "text-blue-600"}`}
                            >
                              {v.currentStock}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto"
            >
              <button
                onClick={resetScanner}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-4 transition"
              >
                <ArrowLeft className="w-4 h-4" /> กลับไปเลือกสินค้า
              </button>

              {/* ✨ ส่วนแสดงผลชื่อสินค้าที่เพิ่มเข้ามาใหม่ ✨ */}
              <div className="text-center mb-6">
                <p className="text-xl font-mono font-bold text-black bg-gray-100 py-1.5 px-3 rounded-lg inline-block mb-3">
                  {scannedSku}
                </p>

                {selectedProductDetail ? (
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                    <p className="text-lg font-bold text-gray-800">
                      {selectedProductDetail.productName}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {selectedProductDetail.details}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      สต๊อกคงเหลือปัจจุบัน:{" "}
                      <span className="font-bold text-blue-600 text-sm">
                        {selectedProductDetail.currentStock}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                    กำลังโหลดข้อมูลสินค้า หรือไม่พบสินค้าในระบบ
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
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
                    className="flex-1 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-black outline-none transition"
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
                  className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600 border border-red-100"}`}
                >
                  {message.text}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ส่งสินค้าไปที่ใด?
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3 outline-none focus:border-black bg-white font-medium"
                >
                  <option value="บ้านแดง">บ้านแดง</option>
                  <option value="ลูกค้า">ลูกค้า</option>
                  <option value="แบ่งบรรจุ">แบ่งบรรจุ</option>
                </select>
              </div>

              <button
                onClick={handleDeductStock}
                disabled={
                  loading ||
                  message.type === "success" ||
                  (selectedProductDetail &&
                    quantity > selectedProductDetail.currentStock)
                }
                className="w-full py-4 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? "กำลังบันทึก..." : "ยืนยันตัดสต๊อก"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
