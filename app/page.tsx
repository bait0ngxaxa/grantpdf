"use client";

import { useRouter } from "next/navigation";
import Head from "next/head";

export default function Home() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/signin");
    };

    return (
        <>
            <Head>
                <title>Home | Grant Online</title>
            </Head>
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="card w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl transform transition-transform duration-300 hover:scale-[1.01] overflow-hidden">
                    <div className="card-body p-8 sm:p-12 text-center">
                        <div className="flex flex-col items-center mb-6">
                            {/* SVG Icon for the system */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {/* System Name */}
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                GRANT ONLINE
                            </h1>
                            {/* Slogan or Description */}
                            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                                ระบบสร้างและกรอกแบบฟอร์ม PDF อัตโนมัติ
                            </p>
                        </div>
                        
                        {/* Call-to-action description */}
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8">
                            เริ่มต้นใช้งานระบบของเราเพื่อสร้างเอกสาร TORS และแบบฟอร์มอื่นๆ ได้อย่างง่ายดายและรวดเร็ว
                        </p>

                        {/* Action button */}
                        <button
                            className="btn btn-primary w-full rounded-full mt-4 shadow-lg transform transition-transform duration-300 hover:scale-105"
                            onClick={handleClick}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}