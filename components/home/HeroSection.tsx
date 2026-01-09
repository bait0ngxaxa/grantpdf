import Link from "next/link";

interface HeroSectionProps {
    isLoggedIn: boolean;
}

export default function HeroSection({
    isLoggedIn,
}: HeroSectionProps): React.ReactElement {
    return (
        <div className="text-center max-w-5xl mx-auto mb-20 bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-slate-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none opacity-50"></div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    GRANT ONLINE
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                    สร้างและจัดการเอกสาร <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-x">
                        GRANT ONLINE
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    สำหรับการสร้าง ใบอนุมัติ, สัญญา, TOR และเอกสารโครงการต่างๆ{" "}
                    <br />
                    พร้อมติดตามสถานะ
                </p>

                {!isLoggedIn && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <button className="h-12 px-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                                ลงทะเบียน
                            </button>
                        </Link>
                        <Link href="/signin">
                            <button className="h-12 px-8 rounded-full bg-slate-50 text-slate-600 border border-slate-200 font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 w-full sm:w-auto">
                                เข้าสู่ระบบ
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
