import React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

function PreviewToolbar() {
    // state ซูมในหน้า (ย้ายเข้ามาใน component)
    const [zoom, setZoom] = React.useState(0.95);

    return (
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-white dark:bg-neutral-800">
            <span className="text-sm text-gray-600 dark:text-gray-300">
                Zoom
            </span>
            <button
                type="button"
                onClick={() =>
                    setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))
                }
                className="px-2 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-neutral-700"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-14 text-center text-sm">
                {Math.round(zoom * 100)}%
            </span>
            <button
                type="button"
                onClick={() =>
                    setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))
                }
                className="px-2 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-neutral-700"
            >
                <Plus className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => setZoom(1)}
                className="ml-2 px-2 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-1"
            >
                <RotateCcw className="w-4 h-4" /> 100%
            </button>
        </div>
    );
}

/** กระดาษ A4 กึ่งกลาง + เงา + margin เป็น cm */
function PaperA4({
    children,
    zoom = 1,
    marginCm = 2.2,
    orientation = "portrait", // "landscape" ก็ได้
}: {
    children: React.ReactNode;
    zoom?: number;
    marginCm?: number;
    orientation?: "portrait" | "landscape";
}) {
    const size =
        orientation === "portrait"
            ? { w: "21cm", h: "29.7cm" }
            : { w: "29.7cm", h: "21cm" };

    return (
        <div
            className="relative bg-white shadow-2xl border print:shadow-none print:border-0"
            style={{
                width: size.w,
                height: size.h,
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
            }}
        >
            <div
                className="max-w-none"
                style={{
                    boxSizing: "border-box",
                    padding: `${marginCm}cm`,
                    fontFamily: `'TH Sarabun New', Arial, sans-serif`,
                    // ขนาดตัวอักษร/ระยะบรรทัดให้เหมือน Word
                    fontSize: "22px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                }}
            >
                {children}
            </div>
        </div>
    );
}

export { PreviewToolbar, PaperA4 };
