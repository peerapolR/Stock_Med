import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/mongodb";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongo();

        // ค้นหา User จาก Database
        const user = await User.findOne({ username: credentials.username });
        if (!user) {
          throw new Error("ไม่พบชื่อผู้ใช้นี้ในระบบ");
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordMatch) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        // ส่งข้อมูลผู้ใช้กลับไปเก็บใน Session
        return {
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    // เอาข้อมูลใส่ใน JWT Token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    // เอาข้อมูลจาก Token มาใส่ใน Session เพื่อให้ฝั่งหน้าเว็บดึงไปใช้ได้
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // กำหนดหน้า Login ของเราเอง
  },
  secret: process.env.NEXTAUTH_SECRET, // อย่าลืมใส่ NEXTAUTH_SECRET ใน .env.local
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
