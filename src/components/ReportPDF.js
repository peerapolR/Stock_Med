import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// สมมติว่าคุณลงทะเบียนฟอนต์ NotoSansThai ไว้แบบนี้ (ถ้าของคุณ Path ต่างจากนี้ ให้แก้กลับเป็นของคุณนะครับ)
Font.register({
  family: "NotoSansThai",
  src: "/fonts/NotoSansThai-Regular.ttf",
});

// สร้าง Style สำหรับ PDF
const styles = StyleSheet.create({
  page: {
    padding: 30, // ขอบกระดาษ
    fontFamily: "NotoSansThai",
    backgroundColor: "#FFFFFF",
  },
  // ส่วนหัวรายงาน
  headerContainer: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  reportTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  reportDate: { fontSize: 12, color: "#4B5563" },

  // ตาราง
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
    height: 30,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
    minHeight: 28, // ล็อกความสูงขั้นต่ำ ไม่ให้กล่องยืดตามใจชอบ
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA", // สีสลับบรรทัด
  },

  // ตั้งค่าความกว้างคอลัมน์ (รวมกันต้องได้ 100%)
  colTime: { width: "15%", paddingLeft: 8 },
  colType: { width: "10%", textAlign: "center" },
  colDest: { width: "13%", paddingLeft: 4 },
  colSku: { width: "14%", paddingLeft: 4 },
  colName: { width: "25%", paddingLeft: 4 },
  colQty: { width: "9%", textAlign: "right", paddingRight: 4 },
  colUser: { width: "14%", textAlign: "right", paddingRight: 8 },

  // ตัวหนังสือ
  headerText: { fontSize: 10, fontWeight: "bold", color: "#374151" },
  cellText: { fontSize: 9, color: "#1F2937" },
  badgeIn: { color: "#059669" }, // สีเขียวตอนนำเข้า
  badgeOut: { color: "#DC2626" }, // สีแดงตอนขายออก
});

// ฟังก์ชันแปลงวันที่ให้สั้นลงเพื่อประหยัดพื้นที่คอลัมน์ (เช่น 15/10/24 14:30)
const formatShortDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}/${month}/${year} ${time}`;
};

export default function ReportPDF({ data, reportDate, reportType }) {
  // สร้างหัวข้อรายงาน
  const getReportTitle = () => {
    if (reportType === "IN") return "รายงานรับสินค้าเข้าคลัง";
    if (reportType === "OUT") return "รายงานเบิก/ขายสินค้าออก";
    return "รายงานการเข้า-ออกสต๊อก (ทั้งหมด)";
  };

  return (
    <Document>
      {/* เปลี่ยนจาก landscape เป็น A4 แนวตั้งปกติ */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.reportTitle}>{getReportTitle()}</Text>
          </View>
          <View>
            <Text style={styles.reportDate}>
              ข้อมูลประจำวันที่/เดือน: {reportDate || "ทั้งหมด"}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRowHeader}>
            <Text style={[styles.colTime, styles.headerText]}>วัน/เวลา</Text>
            <Text style={[styles.colType, styles.headerText]}>รายการ</Text>
            <Text style={[styles.colDest, styles.headerText]}>สถานที่ส่ง</Text>
            <Text style={[styles.colSku, styles.headerText]}>SKU</Text>
            <Text style={[styles.colName, styles.headerText]}>ชื่อสินค้า</Text>
            <Text style={[styles.colQty, styles.headerText]}>จำนวน</Text>
            <Text style={[styles.colUser, styles.headerText]}>ผู้ทำรายการ</Text>
          </View>

          {/* Table Body */}
          {data.map((row, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 !== 0 ? styles.tableRowAlt : {},
              ]} // สลับสีพื้นหลัง
            >
              <Text style={[styles.colTime, styles.cellText]}>
                {formatShortDate(row.date)}
              </Text>

              <Text
                style={[
                  styles.colType,
                  styles.cellText,
                  row.type === "IN" ? styles.badgeIn : styles.badgeOut,
                ]}
              >
                {row.type === "IN" ? "นำเข้า" : "ขายออก"}
              </Text>

              <Text style={[styles.colDest, styles.cellText]}>
                {row.destination || "-"}
              </Text>
              <Text style={[styles.colSku, styles.cellText]}>{row.sku}</Text>

              {/* ชื่อสินค้าอาจจะยาว เลยให้ตัดคำลงมาได้ถ้าจำเป็น */}
              <Text style={[styles.colName, styles.cellText]}>
                {row.productName || "-"}
              </Text>

              <Text
                style={[
                  styles.colQty,
                  styles.cellText,
                  row.type === "IN" ? styles.badgeIn : styles.badgeOut,
                ]}
              >
                {row.type === "IN" ? "+" : "-"}
                {row.quantity}
              </Text>

              <Text style={[styles.colUser, styles.cellText]}>
                {row.performedBy}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
