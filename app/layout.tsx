import { type Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "sonner";
import {
    CLOUDFLARE_WEB_ANALYTICS_SCRIPT_SRC,
    CLOUDFLARE_WEB_ANALYTICS_TOKEN_ENV,
} from "@/lib/shared/constants";

const googleSans = localFont({
    src: "../public/font/GoogleSans-VariableFont.woff2",
    variable: "--font-google-sans",
    display: "swap",
});

const LOCAL_ANALYTICS_HOSTNAMES = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
]);

export const metadata: Metadata = {
    //title: "Next App",
    description: "Generated Documents,By Grant Online",
};

type CloudflareWebAnalyticsProps = {
    host: string | null;
    nonce: string | null;
};

function getHostname(host: string): string {
    if (host.startsWith("[")) {
        const closingBracketIndex = host.indexOf("]");
        if (closingBracketIndex === -1) {
            return host.toLowerCase();
        }

        return host.slice(1, closingBracketIndex).toLowerCase();
    }

    return host.split(":")[0].toLowerCase();
}

function isLocalhost(host: string | null): boolean {
    if (!host) {
        return false;
    }

    const hostname = getHostname(host);
    return LOCAL_ANALYTICS_HOSTNAMES.has(hostname);
}

function CloudflareWebAnalytics({
    host,
    nonce,
}: CloudflareWebAnalyticsProps): React.JSX.Element | null {
    const token = process.env[CLOUDFLARE_WEB_ANALYTICS_TOKEN_ENV]?.trim();

    if (!token || process.env.NODE_ENV !== "production" || isLocalhost(host)) {
        return null;
    }

    return (
        <Script
            id="cloudflare-web-analytics"
            src={CLOUDFLARE_WEB_ANALYTICS_SCRIPT_SRC}
            strategy="afterInteractive"
            nonce={nonce ?? undefined}
            data-cf-beacon={JSON.stringify({ token })}
        />
    );
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): Promise<React.JSX.Element> {
    const requestHeaders = await headers();
    const nonce = requestHeaders.get("x-nonce");
    const host = requestHeaders.get("host");

    return (
        <html lang="th" suppressHydrationWarning>
            <body
                className={`${googleSans.variable} antialiased bg-background text-foreground font-sans`}
            >
                <ThemeProvider>{children}</ThemeProvider>
                <Toaster
                    position="top-right"
                    offset={20}
                    toastOptions={{
                        style: {
                            background: "#ffffff",
                            border: "1px solid rgba(226, 232, 240, 0.95)",
                            fontFamily: "var(--font-google-sans)",
                            boxShadow:
                                "0 16px 36px -24px rgba(15, 23, 42, 0.45), 0 8px 20px -18px rgba(15, 23, 42, 0.32)",
                            borderRadius: "12px",
                        },
                        classNames: {
                            toast: "bg-white text-slate-900",
                            title: "font-semibold tracking-tight",
                            description: "text-slate-500",
                            success:
                                "[&_[data-icon]]:text-emerald-600 [&_[data-title]]:text-emerald-700 [&_[data-description]]:text-emerald-700/80 [&_[data-close-button]]:text-emerald-700",
                            error:
                                "[&_[data-icon]]:text-red-600 [&_[data-title]]:text-red-700 [&_[data-description]]:text-red-700/80 [&_[data-close-button]]:text-red-700",
                            actionButton:
                                "rounded-lg bg-slate-900 text-white hover:bg-slate-700",
                            cancelButton:
                                "rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200",
                            closeButton:
                                "border border-slate-200 bg-white text-slate-500",
                        },
                    }}
                />
                <CloudflareWebAnalytics host={host} nonce={nonce} />
            </body>
        </html>
    );
}
