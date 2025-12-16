"use client";

interface ContractTypeSubmenuProps {
    onContractSelect: (
        templateId: string,
        title: string,
        contractCode?: string
    ) => void;
}

export const ContractTypeSubmenu = ({
    onContractSelect,
}: ContractTypeSubmenuProps) => {
    return (
        <div className="container mx-auto max-w-6xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center mb-2">
                สัญญาจ้างปฏิบัติงานวิชาการ
            </h1>
            <p className="text-center text-base-content/60 mb-8">
                เลือกประเภทสัญญาที่ต้องการสร้าง
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-slate-200 hover:border-primary hover:shadow-2xl"
                    onClick={() =>
                        onContractSelect(
                            "academic-contract-abs",
                            "สัญญาจ้างปฏิบัติงานวิชาการ - ABS",
                            "ABS"
                        )
                    }
                >
                    <div className="card-body items-center text-center p-6">
                        <div className="flex items-center justify-center p-4 rounded-full bg-blue-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="card-title mt-4 text-xl text-blue-600">
                            ABS
                        </h3>
                        <p className="text-sm text-base-content/60">
                            สัญญาจ้างประเภท ABS
                        </p>
                        <div className="mt-2">
                            <div className="badge badge-primary badge-outline">
                                รหัส: ABS
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-slate-200 hover:border-primary hover:shadow-2xl"
                    onClick={() =>
                        onContractSelect(
                            "academic-contract-dmr",
                            "สัญญาจ้างปฏิบัติงานวิชาการ - DMR",
                            "DMR"
                        )
                    }
                >
                    <div className="card-body items-center text-center p-6">
                        <div className="flex items-center justify-center p-4 rounded-full bg-green-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="card-title mt-4 text-xl text-green-600">
                            DMR
                        </h3>
                        <p className="text-sm text-base-content/60">
                            สัญญาจ้างประเภท DMR
                        </p>
                        <div className="mt-2">
                            <div className="badge badge-success badge-outline">
                                รหัส: DMR
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-slate-200 hover:border-primary hover:shadow-2xl"
                    onClick={() =>
                        onContractSelect(
                            "academic-contract-sip",
                            "สัญญาจ้างปฏิบัติงานวิชาการ - SIP",
                            "SIP"
                        )
                    }
                >
                    <div className="card-body items-center text-center p-6">
                        <div className="flex items-center justify-center p-4 rounded-full bg-purple-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="card-title mt-4 text-xl text-purple-600">
                            SIP
                        </h3>
                        <p className="text-sm text-base-content/60">
                            สัญญาจ้างประเภท SIP
                        </p>
                        <div className="mt-2">
                            <div className="badge badge-secondary badge-outline">
                                รหัส: SIP
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
