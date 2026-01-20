// components/providers/ThemeProvider.tsx
// Client component wrapper for next-themes to enable dark mode support
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({
    children,
}: ThemeProviderProps): React.ReactElement {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}
