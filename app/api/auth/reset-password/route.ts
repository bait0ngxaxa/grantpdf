// app/api/auth/reset-password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.PASSRESET_TOKEN_SECRET;

export async function PUT(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        
        if (!token || !newPassword) {
            return NextResponse.json({ error: 'ไม่พบโทเค็นหรือรหัสผ่านใหม่' }, { status: 400 });
        }
        
        if (!JWT_SECRET) {
            throw new Error('SECRET is not defined in the environment variables.');
        }

        
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch (err) {
            console.error('Token verification failed:', err);
            return NextResponse.json({ error: 'ลิงก์หมดอายุหรือไม่ถูกต้อง' }, { status: 400 });
        }

        
        if (typeof decodedToken !== 'object' || !decodedToken.userId) {
            return NextResponse.json({ error: 'โทเค็นไม่ถูกต้อง' }, { status: 400 });
        }
        
        // Find the user by userId from token
        const user = await prisma.user.findUnique({
            where: {
                id: Number(decodedToken.userId),
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน' }, { status: 400 });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' }, { status: 200 });

    } catch (error) {
        console.error('Error during password reset:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
    }
}