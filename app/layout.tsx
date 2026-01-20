import { type Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider, ThemeProvider } from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const googleSans = localFont({
    src: "../public/font/GoogleSans-VariableFont.ttf",
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
    const session = await getServerSession(authOptions);

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${googleSans.variable} antialiased bg-background text-foreground font-sans`}
            >
                <SessionProvider session={session}>
                    <ThemeProvider>{children}</ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
