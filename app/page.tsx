"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/signin");
    };

    return (
        <>
            <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 text-6xl">
                <h1>TEST PAGE</h1>
                <button
                    className="btn btn-primary border-r-4"
                    onClick={handleClick}
                >
                    Next
                </button>
            </div>
        </>
    );
}
