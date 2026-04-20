"use client";
import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // ตั้งค่ากล้องสแกน (เฟรมเรต 10, กรอบสแกน 250x250)
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // เมื่อสแกนสำเร็จ ให้หยุดกล้องและส่งค่ากลับ
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // ไม่ต้องทำอะไร ปล่อยให้มันสแกนต่อไป (error ตรงนี้คือตอนที่มันยังหา QR ไม่เจอ)
      },
    );

    // Cleanup ตอนปิดหน้าจอหรือเปลี่ยนหน้า
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
      <p className="text-center text-gray-500 text-sm mt-4">
        หันกล้องไปที่ QR Code ของสินค้า
      </p>
    </div>
  );
}
