"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams(); // ดึง ID จาก URL
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [variants, setVariants] = useState([]);

  // 1. ดึงข้อมูลเดิมมาใส่ในฟอร์ม
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${params.id}`);
      const result = await res.json();
      if (result.success) {
        setName(result.data.name);
        setCategory(result.data.category);
        setVariants(result.data.variants);
      } else {
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      }
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { sku: "", size: "", weight: "", type: "", currentStock: 0 },
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, variants }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        setError(data.error || "แก้ไขข้อมูลไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto w-10 h-10 text-gray-400" />
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">แก้ไขสินค้า</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium shadow-sm flex items-center gap-2">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">ชื่อสินค้า</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-xl px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-xl px-4 py-2"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">จัดการ Variant</h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-sm bg-black text-white px-3 py-1.5 rounded-lg"
            >
              + เพิ่มแบบใหม่
            </button>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {variants.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-gray-50 rounded-xl relative border border-gray-200"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(i)}
                    className="absolute top-2 right-2 text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] uppercase text-gray-400 font-bold">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) =>
                          handleVariantChange(i, "sku", e.target.value)
                        }
                        className="w-full border rounded-lg px-2 py-1.5 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-400 font-bold">
                        ประเภท
                      </label>
                      <input
                        type="text"
                        value={v.type}
                        onChange={(e) =>
                          handleVariantChange(i, "type", e.target.value)
                        }
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-400 font-bold">
                        ขนาด
                      </label>
                      <input
                        type="text"
                        value={v.weight}
                        onChange={(e) =>
                          handleVariantChange(i, "weight", e.target.value)
                        }
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-400 font-bold">
                        สต๊อก
                      </label>
                      <input
                        type="number"
                        value={v.currentStock}
                        onChange={(e) =>
                          handleVariantChange(
                            i,
                            "currentStock",
                            Number(e.target.value),
                          )
                        }
                        className="w-full border rounded-lg px-2 py-1.5 text-sm text-right"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}{" "}
            บันทึกการแก้ไข
          </button>
        </div>
      </form>
    </div>
  );
}
