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
            </body>
        </html>
    );
}
