import { type Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
    SessionProvider,
    ThemeProvider,
    GlobalModalProvider,
    SWRProvider,
} from "@/components/providers";
import { auth } from "@/lib/auth";
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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): Promise<React.JSX.Element> {
    const session = await auth();

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${googleSans.variable} antialiased bg-background text-foreground font-sans`}
            >
                <SessionProvider session={session}>
                    <ThemeProvider>
                        <GlobalModalProvider>
                            <SWRProvider>{children}</SWRProvider>
                        </GlobalModalProvider>
                    </ThemeProvider>
                </SessionProvider>
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
