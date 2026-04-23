import { type Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "sonner";

const googleSans = localFont({
    src: "../public/font/GoogleSans-VariableFont.woff2",
    variable: "--font-google-sans",
    display: "swap",
});

export const metadata: Metadata = {
    //title: "Next App",
    description: "Generated Documents,By Grant Online",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): React.JSX.Element {
    return (
        <html lang="th" suppressHydrationWarning>
            <body
                className={`${googleSans.variable} antialiased bg-background text-foreground font-sans`}
            >
                <ThemeProvider>{children}</ThemeProvider>
                <Toaster
                    position="top-right"
                    richColors
                    offset={20}
                    toastOptions={{
                        style: {
                            background:
                                "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 55%, rgba(239,246,255,0.98) 100%)",
                            border: "1px solid rgba(148, 163, 184, 0.35)",
                            boxShadow:
                                "0 18px 40px -20px rgba(15, 23, 42, 0.48), 0 10px 22px -18px rgba(2, 132, 199, 0.55)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "16px",
                        },
                        classNames: {
                            toast: "text-slate-900 dark:text-slate-100",
                            title: "font-semibold tracking-tight",
                            description:
                                "text-slate-600 dark:text-slate-300/90",
                            error:
                                "bg-gradient-to-br from-rose-50/95 via-white to-red-100/90 dark:from-rose-950/85 dark:via-slate-900 dark:to-red-950/80 border-rose-300/60 dark:border-rose-800/60 shadow-[0_18px_40px_-22px_rgba(190,18,60,0.58)]",
                            actionButton:
                                "rounded-lg bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
                            cancelButton:
                                "rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
                            closeButton:
                                "bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700",
                        },
                    }}
                />
            </body>
        </html>
    );
}
