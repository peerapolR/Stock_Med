"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Package, CheckCircle2 } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State ข้อมูลหลักของสินค้า
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  // State สำหรับจัดการ Variants (เริ่มต้นให้มี 1 รายการ)
  const [variants, setVariants] = useState([
    { sku: "", size: "", weight: "", type: "ถุง/ห่อ", currentStock: 0 },
  ]);

  // ฟังก์ชันเพิ่ม Variant ใหม่
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { sku: "", size: "", weight: "", type: "ถุง/ห่อ", currentStock: 0 },
    ]);
  };

  // ฟังก์ชันลบ Variant
  const handleRemoveVariant = (indexToRemove) => {
    if (variants.length === 1) return; // บังคับว่าต้องมีอย่างน้อย 1 variant
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };

  // ฟังก์ชันอัปเดตข้อมูลในแต่ละ Variant
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // ฟังก์ชัน Gen SKU อัตโนมัติ (ตัวช่วยเผื่อขี้เกียจคิด)
  const generateSKU = (index) => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = category ? category.substring(0, 3).toUpperCase() : "SKU";
    handleVariantChange(index, "sku", `${prefix}-${randomCode}`);
  };

  // บันทึกข้อมูลลง Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // เช็คความเรียบร้อยของข้อมูล
    const hasEmptySKU = variants.some((v) => !v.sku.trim());
    if (hasEmptySKU) {
      setError("กรุณากรอกรหัส SKU ให้ครบทุกรายการ (หรือกด Gen อัตโนมัติ)");
      setLoading(false);
      return;
    }

    try {
      // เรียกใช้ API /api/products ที่เราเขียนไว้ในตอนแรก
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, variants }),
      });

      const data = await res.json();

      if (data.success) {
        // บันทึกสำเร็จ เด้งกลับไปหน้ารายการสินค้า
        router.push("/dashboard/products");
        router.refresh();
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h1>
          <p className="text-sm text-gray-500">
            กรอกรายละเอียดสินค้าและสร้าง Variant (ขนาด/รูปแบบ)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium shadow-sm flex items-center gap-2">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* กล่องข้อมูลหลัก */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> ข้อมูลทั่วไป
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อวัตถุดิบ/สินค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น เมล็ดกาแฟอาราบิก้า, น้ำเชื่อมคาราเมล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <input
                type="text"
                placeholder="เช่น กาแฟ, ไซรัป, นม, แพคเกจจิ้ง"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* กล่องจัดการ Variants */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> การจัดจำหน่าย (Variants)
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-sm flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> เพิ่มขนาด/รูปแบบ
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {variants.map((variant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden"
                >
                  {/* ปุ่มลบ Variant */}
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pr-8">
                    {/* SKU */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        รหัส SKU <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="เช่น COF-A-250G"
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "sku",
                              e.target.value.toUpperCase(),
                            )
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => generateSKU(index)}
                          className="px-2 border border-gray-200 rounded-lg text-xs bg-white hover:bg-gray-100 transition"
                        >
                          Gen
                        </button>
                      </div>
                    </div>

                    {/* ประเภท */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        ประเภท
                      </label>
                      <select
                        value={variant.type}
                        onChange={(e) =>
                          handleVariantChange(index, "type", e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black text-sm bg-white"
                      >
                        <option value="ถุง/ห่อ">ถุง/ห่อ</option>
                        <option value="กระสอบ">กระสอบ</option>
                        <option value="ลัง/กล่อง">ลัง/กล่อง</option>
                        <option value="ขวด">ขวด</option>
                        <option value="ชิ้น">ชิ้น</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        ขนาด/น้ำหนัก
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 250g, 1L"
                        value={variant.weight}
                        onChange={(e) =>
                          handleVariantChange(index, "weight", e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black text-sm"
                      />
                    </div>

                    {/* สต๊อกตั้งต้น */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        สต๊อกเริ่มต้น
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={variant.currentStock}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "currentStock",
                            Number(e.target.value),
                          )
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black text-sm text-right"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl font-medium bg-black text-white hover:bg-gray-800 transition shadow-lg shadow-gray-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกสินค้าใหม่"}
          </button>
        </div>
      </form>
    </div>
  );
}
