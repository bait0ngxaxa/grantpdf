"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/signin");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="card w-full max-w-xl bg-white border border-base-300 shadow-xl p-8 sm:p-12 text-center">
                <div className="card-body items-center">
                    {/* ชื่อระบบ */}
                    <h1 className="text-4xl font-bold text-primary mb-4">
                        GRANT ONLINE
                    </h1>

                    {/* คำอธิบาย */}
                    <p className="text-base sm:text-lg text-base-content mb-6">
                        ระบบสร้างและกรอกแบบฟอร์ม PDF อัตโนมัติ
                    </p>

                    {/* ปุ่ม */}
                    <button
                        className="btn btn-primary rounded-xl px-8 text-base"
                        onClick={handleClick}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </main>
    );
}
