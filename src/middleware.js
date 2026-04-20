import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // ถ้ายังไม่ Login ให้เตะมาหน้านี้
  },
});

export const config = {
  // สำคัญมาก: ระบุ path ที่ต้องการให้ยามเฝ้า
  matcher: [
    "/dashboard/:path*", // เฝ้าทุกหน้าเว็บที่ขึ้นต้นด้วย /dashboard
  ],
};
