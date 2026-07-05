import type React from "react";
import Image from "next/image";
import { PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/shared/utils";

type SidebarLogoTone = "blue" | "orange";

type SidebarLogoToggleEvent =
    | React.FocusEvent<HTMLButtonElement>
    | React.MouseEvent<HTMLButtonElement>;

const logoStyles: Record<SidebarLogoTone, string> = {
    blue: "border-blue-100 bg-white shadow-blue-500/25 ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:ring-blue-900/50",
    orange: "border-orange-100 bg-white shadow-orange-200/55 ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:ring-orange-900/45",
};

const openButtonStyles: Record<SidebarLogoTone, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-600 shadow-blue-100/80 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:shadow-none",
    orange: "border-orange-200 bg-orange-50 text-orange-700 shadow-orange-100/70 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-300 dark:shadow-none",
};

const focusRingStyles: Record<SidebarLogoTone, string> = {
    blue: "focus-visible:ring-blue-500/45 dark:focus-visible:ring-offset-slate-900",
    orange: "focus-visible:ring-orange-500/35 dark:focus-visible:ring-offset-slate-900",
};

interface SidebarLogoToggleProps {
    controlsId: string;
    onHideTooltip: () => void;
    onOpen: () => void;
    onShowTooltip: (event: SidebarLogoToggleEvent) => void;
    tone: SidebarLogoTone;
}

export function SidebarLogoToggle({
    controlsId,
    onHideTooltip,
    onOpen,
    onShowTooltip,
    tone,
}: SidebarLogoToggleProps): React.JSX.Element {
    const handleOpen = (): void => {
        onHideTooltip();
        onOpen();
    };

    return (
        <button
            type="button"
            aria-label="เปิดเมนูด้านข้าง"
            aria-controls={controlsId}
            aria-expanded={false}
            onClick={handleOpen}
            onBlur={onHideTooltip}
            onFocus={onShowTooltip}
            onMouseEnter={onShowTooltip}
            onMouseLeave={onHideTooltip}
            className={cn(
                "group relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none lg:flex",
                focusRingStyles[tone],
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border shadow-lg ring-1 group-hover:hidden group-focus-visible:hidden",
                    logoStyles[tone],
                )}
            >
                <Image
                    src="/e-grant_logo.webp"
                    alt=""
                    width={52}
                    height={52}
                    className="h-full w-full rounded-xl object-cover"
                />
            </span>
            <span
                aria-hidden="true"
                className={cn(
                    "absolute inset-0 hidden items-center justify-center rounded-xl border shadow-md group-hover:flex group-focus-visible:flex",
                    openButtonStyles[tone],
                )}
            >
                <PanelLeftOpen className="h-5 w-5" />
            </span>
        </button>
    );
}
