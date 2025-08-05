import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.JWT_SECRET || 'super-secret-key'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    )

    const res = NextResponse.json(
      { message: 'เข้าสู่ระบบสำเร็จ' },
      { status: 200 }
    )

    // ✅ เซ็ต cookie โดยใช้ API ของ NextResponse
    res.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', // Dev ห้ามใส่ true
    })

    return res
  } catch (err) {
    console.error('Login API error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' }, { status: 500 })
  }
}
