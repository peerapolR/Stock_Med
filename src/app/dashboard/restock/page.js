"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PackagePlus, Search, CheckCircle2, House } from "lucide-react";

export default function RestockPage() {
  const router = useRouter();

  const { data: session } = useSession();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form State
  const [selectedSku, setSelectedSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ดึงข้อมูลสินค้าทั้งหมดมาเพื่อทำ Dropdown
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        const flattenedVariants = [];
        data.data.forEach((product) => {
          product.variants.forEach((variant) => {
            flattenedVariants.push({
              productName: product.name,
              sku: variant.sku,
              details: `${variant.size} ${variant.weight} (${variant.type})`,
              currentStock: variant.currentStock,
            });
          });
        });
        setVariants(flattenedVariants);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // กรองสินค้าตามช่องค้นหา
  const filteredVariants = variants.filter(
    (v) =>
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // กดปุ่มยืนยันรับเข้า
  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedSku || !quantity) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/stock/in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: selectedSku,
          quantity: Number(quantity),
          performedBy: session?.user?.name || "พนักงาน",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          text: `✅ เติมสต๊อก ${selectedSku} สำเร็จ (+${quantity})`,
          type: "success",
        });
        setQuantity("");
        setSelectedSku("");
        setSearchQuery("");
        fetchProducts(); // โหลดข้อมูลสต๊อกใหม่ให้เป็นปัจจุบัน

        // ล้างข้อความแจ้งเตือนหลัง 3 วินาที
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: `❌ ${data.message}`, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        กำลังโหลดข้อมูลสินค้า...
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen">
      <div className="mb-6 flex gap-5">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer flex mb-6"
        >
          <House className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-green-600" /> รับสินค้าเข้าคลัง
            (เติมสต๊อก)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ค้นหาสินค้าตาม SKU หรือชื่อ เพื่อเพิ่มจำนวนเข้าสต๊อก
          </p>
        </div>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          {message.text}
        </motion.div>
      )}

      <form
        onSubmit={handleRestock}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6"
      >
        {/* ค้นหาสินค้า */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลือกสินค้าที่ต้องการเติม (SKU)
          </label>
          <div className="relative mb-3">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="พิมพ์ชื่อสินค้า หรือ SKU เพื่อค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50">
            {filteredVariants.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                ไม่พบรายการสินค้า
              </div>
            ) : (
              filteredVariants.map((v) => (
                <label
                  key={v.sku}
                  className={`flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition ${selectedSku === v.sku ? "bg-green-50 border-l-4 border-l-green-500" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="sku"
                      value={v.sku}
                      checked={selectedSku === v.sku}
                      onChange={() => setSelectedSku(v.sku)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{v.sku}</p>
                      <p className="text-xs text-gray-500">
                        {v.productName} - {v.details}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">สต๊อกเดิม</p>
                    <p className="text-sm font-bold text-gray-600">
                      {v.currentStock}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* จำนวนที่ต้องการเติม */}
        {selectedSku && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวนที่รับเข้า (ชิ้น/แพ็ค)
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="ระบุจำนวน"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-xl font-bold border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </motion.div>
        )}

        <button
          type="submit"
          disabled={saving || !selectedSku || !quantity}
          className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? (
            "กำลังบันทึก..."
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> ยืนยันรับสินค้าเข้า
            </>
          )}
        </button>
      </form>
    </div>
  );
}
