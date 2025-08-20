// app/api/auth/reset-password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.PASSRESET_TOKEN_SECRET;

export async function PUT(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        // 1. Validate the input
        if (!token || !newPassword) {
            return NextResponse.json({ error: 'ไม่พบโทเค็นหรือรหัสผ่านใหม่' }, { status: 400 });
        }
        
        if (!JWT_SECRET) {
            throw new Error('SECRET is not defined in the environment variables.');
        }

        // 2. Verify the JWT token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch (err) {
            console.error('Token verification failed:', err);
            return NextResponse.json({ error: 'ลิงก์หมดอายุหรือไม่ถูกต้อง' }, { status: 400 });
        }

        // 3. Type guard to ensure decodedToken is an object with userId
        //    This is the fix for the TypeScript error.
        if (typeof decodedToken !== 'object' || !decodedToken.userId) {
            return NextResponse.json({ error: 'โทเค็นไม่ถูกต้อง' }, { status: 400 });
        }
        
        // 4. Find the user by the token and check for expiry
        const user = await prisma.user.findFirst({
            where: {
                id: Number(decodedToken.userId),
                passwordResetToken: token,
                passwordResetExpire: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
        }

        // 5. Hash the new password before saving it
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 6. Update the user's password and clear the reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpire: null,
            },
        });

        return NextResponse.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' }, { status: 200 });

    } catch (error) {
        console.error('Error during password reset:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
    }
}