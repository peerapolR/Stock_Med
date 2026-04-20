"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { ArrowLeft } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const result = await res.json();
      if (result.success) setProducts(result.data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการสินค้าและสต๊อก
          </h1>
        </div>
        <Link
          href="/dashboard/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      <div className="grid gap-4">
        {products.map((product, idx) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold text-gray-700">
              {product.name} ({product.category})
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm text-left text-gray-600">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">ขนาด/น้ำหนัก</th>
                    <th className="pb-2 text-right">สต๊อกคงเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.sku}>
                      <td className="pt-2 font-mono text-gray-800">
                        {variant.sku}
                      </td>
                      <td className="pt-2">
                        {variant.size} {variant.weight} ({variant.type})
                      </td>
                      <td className="pt-2 text-right font-medium text-blue-600">
                        {variant.currentStock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
