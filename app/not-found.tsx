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
                {/* 404 Large Display */}
                <div className="mb-6 relative">
                    <h1 className="text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-x select-none drop-shadow-2xl">
                        404
                    </h1>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full">
                        <span className="inline-block px-4 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold tracking-wider uppercase">
                            Page Not Found
                        </span>
                    </div>
                </div>

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
