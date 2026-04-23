import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface HeroSectionProps {
    isLoggedIn: boolean;
}

export default function HeroSection({
    isLoggedIn,
}: HeroSectionProps): React.ReactElement {
    return (
        <div className="text-center max-w-5xl mx-auto mb-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-slate-900/50 p-10 md:p-16 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-700 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 dark:bg-blue-900 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none opacity-50" />

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/50 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium text-sm mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    GRANT ONLINE
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 leading-tight text-balance">
                    สร้างและจัดการเอกสาร <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-x">
                        GRANT ONLINE
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    สำหรับการสร้าง ใบอนุมัติ, สัญญา, TOR และเอกสารโครงการต่างๆ{" "}
                    <br />
                    พร้อมติดตามสถานะ
                </p>

                {!isLoggedIn && (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={ROUTES.SIGNIN}
                                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/35 dark:shadow-blue-950/30 sm:w-auto"
                            >
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                href={ROUTES.SIGNUP}
                                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-8 font-semibold text-blue-700 shadow-sm shadow-blue-200/50 transition hover:bg-blue-100 hover:border-blue-300 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:shadow-blue-950/20 dark:hover:bg-blue-900/50 sm:w-auto"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

