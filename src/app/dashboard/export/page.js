"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import ProductPDF from "@/components/ProductPDF";
import { motion } from "framer-motion";

import { House } from "lucide-react";

export default function ExportPage() {
  const router = useRouter();

  const [pdfData, setPdfData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataAndGenerateQR = async () => {
      try {
        // 1. ดึงข้อมูลสินค้าจาก API ที่เราทำไว้ตอนแรก
        const res = await fetch("/api/products");
        const result = await res.json();

        if (!result.success) return;

        const flattenedData = [];

        // 2. แตกข้อมูลสินค้าและสร้าง QR Code เป็น Base64
        for (const product of result.data) {
          for (const variant of product.variants) {
            // สร้าง QR Code จาก SKU
            const qrDataUrl = await QRCode.toDataURL(variant.sku, {
              margin: 1,
              width: 150,
              color: {
                dark: "#000000",
                light: "#ffffff",
              },
            });

            flattenedData.push({
              name: product.name,
              sku: variant.sku,
              size: variant.size,
              weight: variant.weight,
              type: variant.type,
              qrDataUrl: qrDataUrl, // เก็บรูปภาพไว้โยนเข้า PDF
            });
          }
        }

        setPdfData(flattenedData);
      } catch (error) {
        console.error("Error generating QR data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndGenerateQR();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer flex mb-6"
      >
        <House className="w-5 h-5 text-gray-600" />{" "}
        <span className="ml-2">กลับหน้าหลัก</span>
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center w-full"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M9 15l3 3 3-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Export QR Code สินค้า
          </h1>
          <p className="text-gray-500 mt-2">
            ระบบพบรายการสินค้าทั้งหมด {pdfData.length} รายการ (แยกตาม SKU){" "}
            <br />
            พร้อมให้คุณดาวน์โหลดเป็นไฟล์ PDF แล้ว
          </p>
        </div>

        {/* ปุ่มดาวน์โหลด PDF */}
        {pdfData.length > 0 && (
          <PDFDownloadLink
            document={<ProductPDF data={pdfData} />}
            fileName="products-qrcode.pdf"
            className="inline-block bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200"
          >
            {({ blob, url, loading, error }) =>
              loading ? "กำลังสร้างไฟล์ PDF..." : "ดาวน์โหลดไฟล์ PDF"
            }
          </PDFDownloadLink>
        )}
      </motion.div>
    </div>
  );
}
