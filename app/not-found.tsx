// app/not-found.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:40px_40px] pointer-events-none" />

            <section className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8 md:p-12 text-center ring-1 ring-slate-900/5">
                {/* Visual Element */}
                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                        <span className="text-4xl">🤔</span>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-200 rounded-full blur-xl opacity-50 animate-pulse" />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-slate-600 mb-6 shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                    <span>404 – Page Not Found</span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                    หลงทางนิดหน่อย <br className="hidden sm:block" />
                    แต่ไม่เป็นไรนะ ✨
                </h1>

                {/* Subtext */}
                <p className="text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
                    หน้าที่คุณต้องการอาจถูกย้าย ลบ หรือพิมพ์ลิงก์ผิดนิดเดียว
                    ลองกลับไปหน้าเดิมหรือหน้าแรกดูนะ
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto min-w-[140px] border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-12 rounded-xl text-base"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับหน้าก่อนหน้า
                    </Button>

                    <Button
                        asChild
                        className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-base shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            ไปหน้าแรก
                        </Link>
                    </Button>
                </div>

                {/* Footnote */}
                <p className="mt-8 text-xs text-slate-400">
                    หากปัญหายังอยู่ ลองรีเฟรชหน้าจออีกครั้ง
                </p>
            </section>
        </main>
    );
}
