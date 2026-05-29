// next.config.ts
import type { NextConfig } from "next";

const SECURITY_HEADERS = [
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
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },

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
