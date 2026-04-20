"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPDF from "@/components/ReportPDF";

import { ArrowLeft } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterMode, setFilterMode] = useState("daily"); // 'daily' | 'monthly'
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // YYYY-MM-DD
  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7),
  ); // YYYY-MM
  const [filterType, setFilterType] = useState("ALL"); // ALL, IN, OUT

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?type=${filterType}`;

      // เลือกแนบ Parameter ตามโหมดที่เลือก
      if (filterMode === "daily" && filterDate) {
        url += `&date=${filterDate}`;
      } else if (filterMode === "monthly" && filterMonth) {
        url += `&month=${filterMonth}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
    setLoading(false);
  };

  // ดึงข้อมูลใหม่ทุกครั้งที่ Filter เปลี่ยน
  useEffect(() => {
    fetchReports();
  }, [filterMode, filterDate, filterMonth, filterType]);

  // ตัวช่วยสร้างชื่อไฟล์ PDF ให้ตรงกับโหมด
  const getPdfFileName = () => {
    if (filterMode === "daily" && filterDate)
      return `report-daily-${filterDate}.pdf`;
    if (filterMode === "monthly" && filterMonth)
      return `report-monthly-${filterMonth}.pdf`;
    return "report-all.pdf";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              รายงานการเข้า-ออกสต๊อก
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              ตรวจสอบประวัติการขายและเติมสินค้า
            </p>
          </div>
        </div>

        {transactions.length > 0 && (
          <PDFDownloadLink
            document={
              <ReportPDF
                data={transactions}
                reportDate={filterMode === "daily" ? filterDate : filterMonth}
                reportType={filterType}
              />
            }
            fileName={getPdfFileName()}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition shadow-sm flex items-center gap-2"
          >
            {({ loading }) =>
              loading ? "กำลังเตรียมไฟล์ PDF..." : "📥 Export PDF"
            }
          </PDFDownloadLink>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-6 items-end">
        {/* เลือกโหมดดูรายงาน */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            รูปแบบรายงาน
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterMode("daily")}
              className={`px-4 py-1.5 text-sm rounded-md transition ${filterMode === "daily" ? "bg-white shadow-sm font-medium text-black" : "text-gray-500 hover:text-black"}`}
            >
              รายวัน
            </button>
            <button
              onClick={() => setFilterMode("monthly")}
              className={`px-4 py-1.5 text-sm rounded-md transition ${filterMode === "monthly" ? "bg-white shadow-sm font-medium text-black" : "text-gray-500 hover:text-black"}`}
            >
              รายเดือน
            </button>
          </div>
        </div>

        {/* Input วันที่ หรือ เดือน (แปรผันตามโหมด) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {filterMode === "daily" ? "เลือกวันที่" : "เลือกเดือน"}
          </label>
          {filterMode === "daily" ? (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            ประเภทรายการ
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">ทั้งหมด (เข้าและออก)</option>
            <option value="OUT">ขายออก (ตัดสต๊อก)</option>
            <option value="IN">นำเข้า (เติมสต๊อก)</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFilterDate("");
            setFilterMonth("");
          }}
          className="text-sm text-gray-500 hover:text-black underline pb-2 ml-2"
        >
          ล้างเวลา (ดูทั้งหมด)
        </button>
      </div>

      {/* Table Data (เหมือนเดิม) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">วัน/เวลา</th>
                <th className="px-6 py-4 font-medium">รายการ</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">ชื่อสินค้า</th>
                <th className="px-6 py-4 font-medium text-right">จำนวน</th>
                <th className="px-6 py-4 font-medium">ผู้ทำรายการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    ไม่พบข้อมูลในช่วงเวลา/ประเภทที่เลือก
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <motion.tr
                    key={tx._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.date).toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {tx.type === "IN" ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs">
                          นำเข้า
                        </span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs">
                          ขายออก
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-800">
                      {tx.sku}
                    </td>
                    <td className="px-6 py-4">{tx.productName || "-"}</td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${tx.type === "IN" ? "text-green-600" : "text-red-600"}`}
                    >
                      {tx.type === "IN" ? "+" : "-"}
                      {tx.quantity}
                    </td>
                    <td className="px-6 py-4">{tx.performedBy}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
