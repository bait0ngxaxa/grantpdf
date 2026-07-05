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
                    toastOptions={{
                        classNames: {
                            success:
                                "border-emerald-200 bg-emerald-50 text-emerald-900 [&_[data-description]]:text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-100 dark:[&_[data-description]]:text-emerald-200",
                            error:
                                "border-rose-200 bg-rose-50 text-rose-900 [&_[data-description]]:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950 dark:text-rose-100 dark:[&_[data-description]]:text-rose-200",
                            warning:
                                "border-amber-200 bg-amber-50 text-amber-950 [&_[data-description]]:text-amber-900 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-100 dark:[&_[data-description]]:text-amber-200",
                        },
                    }}
                />
            </body>
        </html>
    );
}
