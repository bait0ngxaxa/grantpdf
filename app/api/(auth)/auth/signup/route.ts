// /app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { rateLimit, getClientIP } from "@/lib/ratelimit";
import { logAudit } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();
        const ip = getClientIP(req);
        const rateLimitResult = rateLimit(ip, 5, 60_000);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "Too many requests. Please try again later.",
                    retryAfter: rateLimitResult.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "5",
                        "X-RateLimit-Remaining":
                            rateLimitResult.remaining.toString(),
                        "X-RateLimit-Reset": new Date(
                            rateLimitResult.resetTime
                        ).toISOString(),
                        "Retry-After":
                            rateLimitResult.retryAfter?.toString() || "60",
                    },
                }
            );
        }

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return NextResponse.json(
                { error: "รูปแบบอีเมลไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: trimmedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "อีเมลนี้ถูกใช้ไปแล้ว" },
                { status: 409 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
            },
        });

        // Log successful signup
        logAudit("SIGNUP", String(newUser.id), {
            userEmail: newUser.email,
            ip,
        });

        return NextResponse.json(
            {
                message: "สมัครสมาชิกสำเร็จ",
                data: {
                    user: {
                        id: newUser.id.toString(),
                        name: newUser.name,
                        email: newUser.email,
                    },
                },
            },
            {
                status: 201,
                headers: {
                    "X-RateLimit-Limit": "5",
                    "X-RateLimit-Remaining":
                        rateLimitResult.remaining.toString(),
                    "X-RateLimit-Reset": new Date(
                        rateLimitResult.resetTime
                    ).toISOString(),
                },
            }
        );
    } catch (e) {
        console.error("Error creating user:", e);

        if (e instanceof PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                const target = (e.meta?.target as string[])?.[0];
                if (target === "email") {
                    return NextResponse.json(
                        { error: "อีเมลนี้ถูกใช้ไปแล้ว" },
                        { status: 409 }
                    );
                }
            }
        }

        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
            { status: 500 }
        );
    }
}
