"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QRCode from "qrcode";
import ProductPDF from "@/components/ProductPDF";
import { motion } from "framer-motion";
import { FileDown, Loader2, Printer, House } from "lucide-react";

export default function ExportPage() {
  const router = useRouter();
  const [pdfData, setPdfData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataAndGenerateQR = async () => {
      try {
        const res = await fetch("/api/products");
        const result = await res.json();

        if (!result.success) return;

        const flattenedData = [];

        for (const product of result.data) {
          for (const variant of product.variants) {
            const qrDataUrl = await QRCode.toDataURL(variant.sku, {
              margin: 1,
              width: 150,
              color: { dark: "#000000", light: "#ffffff" },
            });

            flattenedData.push({
              name: product.name,
              sku: variant.sku,
              size: variant.size,
              weight: variant.weight,
              type: variant.type,
              qrDataUrl: qrDataUrl,
            });
          }
        }

        flattenedData.sort((a, b) =>
          a.sku.localeCompare(b.sku, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );

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
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin h-10 w-10 text-black" />
        <p className="text-gray-500 animate-pulse">
          กำลังจัดเตรียมข้อมูลและสร้าง QR Code...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center">
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
        className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 text-center w-full"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-gray-50 text-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Printer className="w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            พิมพ์ QR Code สินค้า
          </h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            ระบบจัดเตรียมรายการสินค้าทั้งหมด{" "}
            <span className="font-bold text-black">
              {pdfData.length} รายการ
            </span>
            โดยเรียงลำดับตาม SKU เรียบร้อยแล้ว พร้อมสำหรับการสั่งพิมพ์
          </p>
        </div>

        {pdfData.length > 0 ? (
          <div className="flex flex-col items-center gap-4">
            <PDFDownloadLink
              document={<ProductPDF data={pdfData} />}
              fileName={`product-qrcodes-${new Date().toISOString().split("T")[0]}.pdf`}
              className="w-full sm:w-auto bg-black text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> กำลังสร้างไฟล์
                    PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" /> ดาวน์โหลด PDF (เรียงตาม
                    SKU)
                  </>
                )
              }
            </PDFDownloadLink>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
              ข้อมูลถูกจัดเรียงจากน้อยไปมาก (A-Z, 0-9)
            </p>
          </div>
        ) : (
          <p className="text-red-500 font-medium">
            ไม่พบข้อมูลสินค้าในระบบ กรุณาเพิ่มสินค้าก่อน
          </p>
        )}
      </motion.div>
    </div>
  );
}
