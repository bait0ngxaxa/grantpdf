// app/api/auth/forgot-password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// IMPORTANT: Use the same secret key as NextAuth.js to maintain consistency.
// The NEXTAUTH_SECRET is already defined in your .env file for NextAuth.
const JWT_SECRET = process.env.NEXTAUTH_SECRET;

// 1. **อีเมลผู้ส่ง:** ตั้งค่าข้อมูลผู้ส่งใน .env และดึงมาใช้ที่นี่
const transporter = nodemailer.createTransport({
    service: 'Gmail',
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
            return NextResponse.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log(`ไม่พบผู้ใช้ด้วยอีเมล ${email} ส่งข้อความทั่วไปเพื่อความปลอดภัย`);
            return NextResponse.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ จะมีลิงก์รีเซ็ตรหัสผ่านถูกส่งไปให้' }, { status: 200 });
        }

        if (!JWT_SECRET) {
            throw new Error('NEXTAUTH_SECRET is not defined in the environment variables.');
        }

        // FIX: แก้ไขโดยการแปลง user.id ให้เป็น String ก่อนนำไปใช้ใน JWT Payload
        // เนื่องจาก Prisma อาจส่งค่า id เป็น BigInt ซึ่งไม่สามารถแปลงเป็น JSON ได้โดยตรง
        const token = jwt.sign({ userId: String(user.id) }, JWT_SECRET, { expiresIn: '1h' });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: token,
                passwordResetExpire: new Date(Date.now() + 3600000),
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER, // อีเมลผู้ส่ง (จาก .env)
            to: email, // อีเมลผู้รับ (จากฟอร์ม)
            subject: 'คำขอรีเซ็ตรหัสผ่าน',
            html: `
                <h1>รีเซ็ตรหัสผ่านของคุณ</h1>
                <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณแล้ว</p>
                <a href="${resetLink}">ตั้งรหัสผ่านใหม่</a>
                <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง ${email} สำเร็จ`);
        return NextResponse.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ จะมีลิงก์รีเซ็ตรหัสผ่านถูกส่งไปให้' }, { status: 200 });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในกระบวนการรีเซ็ตรหัสผ่าน:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
    }
}