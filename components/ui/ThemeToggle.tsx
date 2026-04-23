// components/ui/ThemeToggle.tsx
// Theme toggle button component with Sun/Moon icons
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle(): React.ReactElement {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by waiting for mount
    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    const toggleTheme = (): void => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    // Show placeholder during SSR to prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full p-0 text-slate-500 sm:h-12 sm:w-12"
                aria-label="Toggle theme"
                disabled
            >
                <div className="w-5 h-5" />
            </button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full p-0 text-slate-500 transition-colors duration-300 hover:bg-blue-50/50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-yellow-400 dark:focus-visible:ring-offset-slate-900 sm:h-12 sm:w-12"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
}
