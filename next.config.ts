// next.config.ts
import type { NextConfig } from "next";

/**
 * Security headers — เพื่อให้ <img src="data:..."> จากลายเซ็นแสดงได้ในโปรดักชัน
 * ปรับเพิ่มโดเมนจริงของคุณใน connect-src/img-src ตามที่ใช้งาน
 */
const SECURITY_HEADERS = [
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
            "style-src 'self' 'unsafe-inline' https:",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https:",
            "connect-src 'self' https: blob: data:",
            "media-src 'self' blob: data: https:",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join("; "),
    },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
];

const nextConfig: NextConfig = {
    reactStrictMode: true, // ยังใช้ได้
    poweredByHeader: false,

    async headers() {
        return [
            {
                source: "/(.*)",
                headers: SECURITY_HEADERS,
            },
        ];
    },
};

export default nextConfig;
