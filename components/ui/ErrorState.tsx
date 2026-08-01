"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { ROUTES } from "@/lib/shared/constants";
import { cn } from "@/lib/shared/utils";
import { Button } from "./button";

interface ErrorStateProps {
    title: string;
    description: string;
    onRetry: () => void | Promise<unknown>;
    homeHref?: string;
    retryLabel?: string;
    homeLabel?: string;
    headingLevel?: "h1" | "h2";
    className?: string;
    children?: React.ReactNode;
}

export function ErrorState({
    title,
    description,
    onRetry,
    homeHref = ROUTES.HOME,
    retryLabel = "ลองใหม่อีกครั้ง",
    homeLabel = "กลับหน้าหลัก",
    headingLevel = "h2",
    className,
    children,
}: ErrorStateProps): React.JSX.Element {
    const [isRetrying, setIsRetrying] = useState(false);
    const Heading = headingLevel;

    const handleRetry = async (): Promise<void> => {
        if (isRetrying) return;

        setIsRetrying(true);
        try {
            await onRetry();
        } catch {
            // Keep the error state visible when the retry request fails.
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <div
            role="alert"
            className={cn(
                "flex w-full items-center justify-center px-4 py-12 sm:py-16",
                className,
            )}
        >
            <section className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-xl shadow-slate-200/60 dark:bg-slate-800 dark:shadow-black/20 sm:p-8">
                <div
                    aria-hidden="true"
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                >
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <Heading className="text-xl font-bold text-slate-900 text-balance dark:text-slate-100 sm:text-2xl">
                    {title}
                </Heading>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                    {description}
                </p>

                {children}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                        type="button"
                        onClick={() => void handleRetry()}
                        disabled={isRetrying}
                        aria-busy={isRetrying}
                        className="h-11 w-full sm:flex-1"
                    >
                        <RefreshCw
                            aria-hidden="true"
                            className={cn(
                                "h-4 w-4",
                                isRetrying && "animate-spin",
                            )}
                        />
                        {isRetrying ? "กำลังลองใหม่…" : retryLabel}
                    </Button>
                    <Button
                        asChild
                        type="button"
                        variant="outline"
                        className="h-11 w-full sm:flex-1"
                    >
                        <Link href={homeHref}>
                            <Home aria-hidden="true" className="h-4 w-4" />
                            {homeLabel}
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
