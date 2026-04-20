"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "NotoSansThai",
  src: "/fonts/NotoSansThai-Regular.ttf", // ชี้ไปที่ไฟล์ในโฟลเดอร์ public
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "NotoSansThai", backgroundColor: "#ffffff" },
  header: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: {
    width: "16.6%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f9fafb",
    padding: 5,
  },
  tableCol: {
    width: "16.6%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    margin: 2,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: { margin: 2, fontSize: 10, textAlign: "center" },
  textIn: { color: "#16a34a" }, // สีเขียวสำหรับนำเข้า
  textOut: { color: "#dc2626" }, // สีแดงสำหรับขายออก
});

export default function ReportPDF({ data, reportDate, reportType }) {
  const title =
    reportType === "OUT"
      ? "รายงานสรุปยอดขาย (ตัดสต๊อก)"
      : reportType === "IN"
        ? "รายงานการนำเข้าสต๊อก"
        : "รายงานความเคลื่อนไหวสต๊อกทั้งหมด (เข้า-ออก)";

  const dateText = reportDate
    ? `ประจำวันที่ ${new Date(reportDate).toLocaleDateString("th-TH")}`
    : "ข้อมูลทั้งหมดในระบบ";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subHeader}>{dateText}</Text>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>วัน/เวลา</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>ประเภท</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>SKU</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={{ ...styles.tableCellHeader, width: "200%" }}>
                ชื่อสินค้า
              </Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>จำนวน</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>ผู้ทำรายการ</Text>
            </View>
          </View>

          {/* Table Body */}
          {data.map((row, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {new Date(row.date).toLocaleString("th-TH", {
                    hour12: false,
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text
                  style={{
                    ...styles.tableCell,
                    ...(row.type === "IN" ? styles.textIn : styles.textOut),
                  }}
                >
                  {row.type === "IN" ? "นำเข้า (IN)" : "ขาย (OUT)"}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.sku}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: "200%",
                    textAlign: "left",
                  }}
                >
                  {row.productName || "ไม่ระบุ"}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.performedBy}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
