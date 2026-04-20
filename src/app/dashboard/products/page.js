"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, PackageOpen, ArrowLeft } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const result = await res.json();
      if (result.success) setProducts(result.data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchName = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchSku = product.variants.some((variant) =>
      variant.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return matchName || matchSku;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header Section (เรียงแนวตั้งบนมือถือ แนวนอนบนคอม) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              จัดการสินค้าและสต๊อก
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              รายการสินค้าทั้งหมดในระบบ {products.length} รายการ
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/products/new"
          className="w-full sm:w-auto text-center bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-sm font-medium whitespace-nowrap"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อสินค้า หรือ รหัส SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black text-sm shadow-sm transition"
        />
      </div>

      {/* Product List */}
      <div className="grid gap-4 md:gap-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-10 md:p-16 rounded-2xl border border-gray-100 text-center shadow-sm flex flex-col items-center">
            <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              ไม่พบสินค้าที่ตรงกับ "{searchTerm}"
            </p>
          </div>
        ) : (
          filteredProducts.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-800">
                  {product.name}
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md ml-0 md:ml-2 mt-1 md:mt-0 align-middle">
                    {product.category}
                  </span>
                </h2>
              </div>

              {/* === สำหรับหน้าจอขนาดกลาง-ใหญ่ (Tablet/Desktop) === */}
              <div className="hidden md:block bg-gray-50 rounded-xl p-4 border border-gray-100">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 font-medium text-gray-500 w-1/3">
                        SKU
                      </th>
                      <th className="pb-3 font-medium text-gray-500 w-1/3">
                        รายละเอียด
                      </th>
                      <th className="pb-3 font-medium text-gray-500 text-right w-1/3">
                        สต๊อกคงเหลือ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr
                        key={variant.sku}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-100 transition"
                      >
                        <td className="py-3 font-mono font-medium text-gray-800">
                          <span
                            className={
                              searchTerm &&
                              variant.sku
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                                ? "bg-yellow-200 px-1 rounded"
                                : ""
                            }
                          >
                            {variant.sku}
                          </span>
                        </td>
                        <td className="py-3">
                          {variant.size} {variant.weight} ({variant.type})
                        </td>
                        <td
                          className={`py-3 text-right font-bold text-lg ${variant.currentStock < 10 ? "text-red-600" : "text-blue-600"}`}
                        >
                          {variant.currentStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* === สำหรับหน้าจอขนาดเล็ก (Mobile) === */}
              <div className="block md:hidden space-y-3">
                {product.variants.map((variant) => (
                  <div
                    key={variant.sku}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-mono font-bold text-sm text-gray-800 mb-0.5">
                        <span
                          className={
                            searchTerm &&
                            variant.sku
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                              ? "bg-yellow-200 px-1 rounded"
                              : ""
                          }
                        >
                          {variant.sku}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {variant.size} {variant.weight} ({variant.type})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-medium mb-0.5">
                        คงเหลือ
                      </div>
                      <div
                        className={`font-bold text-lg leading-none ${variant.currentStock < 10 ? "text-red-600" : "text-blue-600"}`}
                      >
                        {variant.currentStock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
