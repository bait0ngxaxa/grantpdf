import React from "react";
import { cn, getAvatarInitial } from "@/lib/shared/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import {
    Users,
    Folder,
    Archive,
    ScrollText,
    ArrowLeft,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { ROUTES } from "@/lib/shared/constants";
import { useAdminDashboardContext } from "../contexts";

const menuItems = [
    {
        id: "dashboard",
        name: "ภาพรวมระบบ",
        icon: <Folder className="h-5 w-5" />,
    },
    {
        id: "documents",
        name: "จัดการโครงการและเอกสาร",
        icon: <Archive className="h-5 w-5" />,
    },
    {
        id: "users",
        name: "จัดการผู้ใช้งาน",
        icon: <Users className="h-5 w-5" />,
    },
    {
        id: "audit",
        name: "บันทึกการใช้ระบบ",
        icon: <ScrollText className="h-5 w-5" />,
    },
];

type SidebarTooltip = {
    name: string;
    left: number;
    top: number;
};

type MenuButtonEvent =
    | React.FocusEvent<HTMLButtonElement>
    | React.MouseEvent<HTMLButtonElement>;

export const AdminSidebar: React.FC = (): React.JSX.Element => {
    const {
        session,
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
    } = useAdminDashboardContext();

    const sidebarRef = React.useRef<HTMLDivElement>(null);
    const [sidebarTooltip, setSidebarTooltip] = React.useState<SidebarTooltip | null>(
        null,
    );
    const [, startTransition] = React.useTransition();
    const closeSidebarOnMobile = (): void => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
            setIsSidebarOpen(false);
        }
    };
    const showSidebarTooltip = (
        name: string,
        event: MenuButtonEvent,
        collapsedOnly = false,
    ): void => {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        if (!isDesktop || (collapsedOnly && isSidebarOpen)) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        setSidebarTooltip({
            name,
            left: rect.right + 12,
            top: rect.top + rect.height / 2,
        });
    };
    const hideSidebarTooltip = (): void => setSidebarTooltip(null);

    React.useEffect(() => {
        if (!isSidebarOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            const isMobile = window.matchMedia("(max-width: 1023px)").matches;
            if (!isMobile) {
                return;
            }

            if (event.key === "Escape") {
                setIsSidebarOpen(false);
                return;
            }

            if (event.key !== "Tab" || !sidebarRef.current) {
                return;
            }

            const focusableElements = sidebarRef.current.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (!(firstElement instanceof HTMLElement) || !(lastElement instanceof HTMLElement)) {
                return;
            }

            if (!sidebarRef.current.contains(document.activeElement)) {
                event.preventDefault();
                if (event.shiftKey) {
                    lastElement.focus();
                } else {
                    firstElement.focus();
                }
                return;
            }

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSidebarOpen, setIsSidebarOpen]);

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity dark:bg-slate-900/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                id="admin-sidebar"
                ref={sidebarRef}
                role="navigation"
                aria-label="เมนูหลักของผู้ดูแลระบบ"
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-full transform flex-col border-r border-orange-100/70 bg-linear-to-b from-white/98 via-orange-50/35 to-amber-50/65 shadow-[8px_0_36px_-24px_rgba(249,115,22,0.45)] backdrop-blur-2xl transition-[width,transform] duration-300 dark:border-orange-900/35 dark:from-slate-950/98 dark:via-orange-950/12 dark:to-slate-900/75 dark:shadow-[8px_0_36px_-24px_rgba(251,146,60,0.28)] lg:translate-x-0",
                    isSidebarOpen
                        ? "w-72 translate-x-0 lg:w-64 xl:w-72"
                        : "w-72 -translate-x-full lg:w-20 lg:translate-x-0",
                )}
            >
                {/* Header */}
                <div className={cn("p-5 pb-2 xl:p-6 xl:pb-2", !isSidebarOpen && "lg:px-4")}>
                    <div
                        className={cn(
                            "mb-8 flex items-center gap-3",
                            isSidebarOpen ? "justify-between" : "justify-center",
                        )}
                    >
                        <div
                            className={cn(
                                "group flex min-w-0 cursor-default items-center gap-3 transition-opacity duration-200",
                                !isSidebarOpen && "hidden",
                            )}
                        >
                            <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-orange-200/55 ring-1 ring-orange-100 transition duration-300 group-hover:scale-105 group-hover:shadow-orange-300/45 dark:bg-slate-800 dark:ring-orange-900/45">
                                <Image
                                    src="/e-grant_logo.webp"
                                    alt="E-GRANT ONLINE"
                                    width={52}
                                    height={52}
                                    className="h-full w-full rounded-xl object-cover"
                                    priority
                                />
                            </div>
                            <div
                                className={cn(
                                    "flex min-w-0 flex-col transition-opacity duration-200",
                                    !isSidebarOpen && "hidden",
                                )}
                            >
                                <h2 className="mb-1 text-lg font-black leading-none text-slate-900 text-balance dark:text-slate-100 xl:text-xl">
                                    Admin Panel
                                </h2>
                                <div className="flex items-center space-x-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    <p className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-300">
                                        Administrator Control
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label={
                                isSidebarOpen
                                    ? "ยุบเมนูด้านข้าง"
                                    : "ขยายเมนูด้านข้าง"
                            }
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            onBlur={hideSidebarTooltip}
                            onFocus={(event) =>
                                showSidebarTooltip(
                                    isSidebarOpen
                                        ? "ยุบเมนูด้านข้าง"
                                        : "ขยายเมนูด้านข้าง",
                                    event,
                                )
                            }
                            onMouseEnter={(event) =>
                                showSidebarTooltip(
                                    isSidebarOpen
                                        ? "ยุบเมนูด้านข้าง"
                                        : "ขยายเมนูด้านข้าง",
                                    event,
                                )
                            }
                            onMouseLeave={hideSidebarTooltip}
                            aria-controls="admin-sidebar"
                            aria-expanded={isSidebarOpen}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-white text-slate-600 shadow-sm shadow-orange-100/50 transition-[border-color,background-color,box-shadow,color,transform] duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md hover:shadow-orange-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none dark:hover:border-orange-800 dark:hover:bg-orange-950/20 dark:hover:text-orange-300 dark:focus-visible:ring-offset-slate-900 lg:h-9 lg:w-9"
                        >
                            {isSidebarOpen ? (
                                <PanelLeftClose className="h-4 w-4" />
                            ) : (
                                <PanelLeftOpen className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                </div>

                {/* Navigation Menu */}
                <nav
                    className={cn(
                        "custom-scrollbar flex-1 overflow-y-auto px-3 xl:px-4",
                        !isSidebarOpen && "lg:px-3",
                    )}
                >
                    <p
                        className={cn(
                            "mb-3 px-4 text-xs font-bold uppercase text-slate-400 dark:text-slate-500",
                            !isSidebarOpen && "lg:hidden",
                        )}
                    >
                        เมนูหลัก
                    </p>
                    <ul className="space-y-1.5">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    aria-label={item.name}
                                    onClick={() => {
                                        startTransition(() => {
                                            setActiveTab(item.id);
                                        });
                                        closeSidebarOnMobile();
                                    }}
                                    onBlur={hideSidebarTooltip}
                                    onFocus={(event) =>
                                        showSidebarTooltip(item.name, event, true)
                                    }
                                    onMouseEnter={(event) =>
                                        showSidebarTooltip(item.name, event, true)
                                    }
                                    onMouseLeave={hideSidebarTooltip}
                                    className={cn(
                                        "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-left font-medium transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300 xl:px-4 xl:py-3.5",
                                        !isSidebarOpen &&
                                            "lg:justify-center lg:px-0",
                                        activeTab === item.id
                                            ? "border-orange-300/35 text-white shadow-lg shadow-orange-400/20"
                                            : "border-transparent text-slate-600 hover:border-orange-100 hover:bg-orange-50/55 hover:text-orange-700 dark:text-slate-300 dark:hover:border-orange-900/35 dark:hover:bg-orange-950/15 dark:hover:text-orange-300",
                                    )}
                                >
                                    {/* Active Background Gradient */}
                                    {activeTab === item.id && (
                                        <>
                                            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-orange-500 via-amber-500 to-orange-400 dark:from-orange-700 dark:via-amber-700 dark:to-orange-600" />
                                            <div className="absolute inset-y-2 left-1 w-1 rounded-full bg-white/85" />
                                        </>
                                    )}

                                    {/* Hover slide effect for inactive items */}
                                    {activeTab !== item.id && (
                                        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-orange-50/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-orange-950/14" />
                                    )}

                                    <span
                                        className={cn(
                                            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105",
                                            activeTab === item.id
                                                ? "bg-white/15 text-white"
                                                : "text-slate-400 group-hover:bg-white/80 group-hover:text-orange-600 dark:text-slate-500 dark:group-hover:bg-slate-900/70 dark:group-hover:text-orange-300",
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={cn(
                                            "relative z-10 min-w-0",
                                            !isSidebarOpen && "lg:hidden",
                                        )}
                                    >
                                        {item.name}
                                    </span>

                                    {/* Right indicator for active item */}
                                    {activeTab === item.id && (
                                        <div
                                            className={cn(
                                                "relative z-10 ml-auto flex items-center",
                                                !isSidebarOpen && "lg:hidden",
                                            )}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className={cn("mt-auto p-4", !isSidebarOpen && "lg:hidden")}>
                    <div className="group relative overflow-hidden rounded-2xl border border-orange-100/75 bg-white/85 p-4 shadow-lg shadow-orange-100/45 backdrop-blur-xl transition duration-300 hover:border-orange-200 hover:bg-white hover:shadow-xl hover:shadow-orange-500/10 dark:border-orange-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:border-orange-800 dark:hover:bg-slate-900 dark:hover:shadow-orange-950/20">
                        {/* Decorativr background blur */}
                        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/55 to-transparent" />

                        <div className="flex items-center space-x-3 mb-3 relative z-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-linear-to-br from-orange-100 via-amber-50 to-white shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:from-orange-900/40 dark:via-amber-900/25 dark:to-slate-800 dark:ring-slate-700">
                                <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                                    {getAvatarInitial(
                                        session?.user?.name,
                                        session?.user?.email,
                                        "A",
                                    )}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                                    {session?.user?.name || "Admin"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 relative z-10">
                            <Button
                                asChild
                                variant="outline"
                                className="h-9 w-full rounded-lg border-orange-100/75 bg-white/70 text-xs font-semibold transition duration-300 hover:border-orange-200 hover:bg-white hover:text-orange-700 hover:shadow-md hover:shadow-orange-500/10 dark:border-slate-600/60 dark:bg-slate-800/70 dark:hover:border-orange-800 dark:hover:bg-slate-800 dark:hover:text-orange-300"
                            >
                                <Link href={ROUTES.DASHBOARD}>
                                    <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                    กลับ User Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {sidebarTooltip && (
                <div
                    role="tooltip"
                    className="pointer-events-none fixed left-24 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 motion-reduce:transition-none dark:border-slate-200 dark:bg-slate-100 dark:text-slate-950 lg:block"
                    style={{
                        left: sidebarTooltip.left,
                        top: sidebarTooltip.top,
                    }}
                >
                    <span className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-slate-950 dark:bg-slate-100" />
                    {sidebarTooltip.name}
                </div>
            )}
        </>
    );
};
