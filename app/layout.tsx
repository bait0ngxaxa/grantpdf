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
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
