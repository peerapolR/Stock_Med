import "./globals.css";
import AuthProvider from "@components/AuthProvider";
import { StockProvider } from "@context/StockContext";

export const metadata = {
  title: "ระบบคลังสินค้า (Inventory Management)",
  description: "จัดการสต๊อกสินค้าและออกรายงาน",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        <AuthProvider>
          <StockProvider>{children}</StockProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
