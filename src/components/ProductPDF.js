"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// โหลดฟอนต์ภาษาไทยจาก Google Fonts เพื่อไม่ให้ภาษาไทยเป็นกล่องสี่เหลี่ยม
Font.register({
  family: "NotoSansThai",
  src: "/fonts/NotoSansThai-Regular.ttf", // ชี้ไปที่ไฟล์ในโฟลเดอร์ public
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NotoSansThai",
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  card: {
    width: "30%", // จัดเรียงแบบ 3 คอลัมน์
    border: "1px solid #e5e7eb",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  qrImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  productName: {
    fontSize: 12,
    marginBottom: 3,
    textAlign: "center",
  },
  variantDetail: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 3,
  },
  sku: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: "3px 6px",
    borderRadius: 3,
  },
});

export default function ProductPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>รายการ QR Code สินค้าทั้งหมด</Text>
        <View style={styles.grid}>
          {data.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image src={item.qrDataUrl} style={styles.qrImage} />
              <Text style={styles.sku}>{item.sku}</Text>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.variantDetail}>
                {item.size} {item.weight} ({item.type})
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
