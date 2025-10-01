// app/not-found.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-white to-blue-50">
      <section className="mx-auto w-full max-w-2xl p-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-2xl text-blue-700">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span>404 – Page Not Found</span>
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-blue-900">
          หลงทางนิดหน่อย แต่ไม่เป็นไรนะ ✨
        </h1>

        {/* Subtext */}
        <p className="mt-2 text-sm text-blue-700/80">
          หน้าที่คุณต้องการอาจถูกย้าย ลบ หรือพิมพ์ลิงก์ผิดนิดเดียว ลองกลับไปหน้าเดิมหรือหน้าแรกดูนะ
        </p>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-blue-200 text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าก่อนหน้า
          </Button>

          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ไปหน้าแรก
            </Link>
          </Button>
        </div>

        {/* Footnote */}
        <p className="mt-6 text-sm text-blue-700/60">
          ถ้าปัญหายังอยู่ ลองรีเฟรชหรือเช็ค URL อีกครั้งนะครับ
        </p>
      </section>
    </main>
  );
}
