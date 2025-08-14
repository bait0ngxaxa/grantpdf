// /app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้ไปแล้ว" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("User created successfully:", newUser);

    // FIX: Convert BigInt 'id' to string before sending in JSON response.
    // This is necessary because JSON.stringify (used by NextResponse.json) cannot serialize BigInt.
    const userResponse = {
      ...newUser,
      id: newUser.id.toString(), // Convert BigInt to string
    };

    return NextResponse.json(
      {
        message: "สมัครสมาชิกสำเร็จ",
        data: {
          user: userResponse, // Send the modified user object
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Error creating user:", e);

    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const target = (e.meta?.target as string[])?.[0];
        if (target === 'email') {
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