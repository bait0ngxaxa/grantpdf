// app/api/auth/forgot-password/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.PASSRESET_TOKEN_SECRET;

// 1. **อีเมลผู้ส่ง:** ตั้งค่าข้อมูลผู้ส่งใน .env และดึงมาใช้ที่นี่
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER, // อีเมลของเซิร์ฟเวอร์ที่ใช้ส่งเมล
        pass: process.env.EMAIL_PASS, // รหัสผ่านของอีเมลนั้น
    },
});

export async function POST(req: NextRequest) {
    try {
        // 2. **อีเมลผู้รับ:** รับอีเมลที่ผู้ใช้กรอกมาจากฟอร์ม
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "กรุณากรอกอีเมล" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
                { status: 200 }
            );
        }

        if (!JWT_SECRET) {
            throw new Error(
                "SECRET is not defined in the environment variables."
            );
        }

        const token = jwt.sign({ userId: String(user.id) }, JWT_SECRET, {
            expiresIn: "1h",
        });

        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER, // อีเมลผู้ส่ง (จาก .env)
            to: email, // อีเมลผู้รับ (จากฟอร์ม)
            subject: "คำขอรีเซ็ตรหัสผ่าน",
            html: `
                <h1>รีเซ็ตรหัสผ่านของคุณ</h1>
                <h2>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณแล้ว</h2>
                <h2><a href="${resetLink}">ตั้งรหัสผ่านใหม่</a></h2>
                <h2>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</h2>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
            { status: 200 }
        );
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในกระบวนการรีเซ็ตรหัสผ่าน:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
            { status: 500 }
        );
    }
}
