import React from "react";
import { cn, getAvatarInitial } from "@/lib/shared/utils";
import Image from "next/image";
import {
    Folder,
    Building2,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { useUserDashboardContext } from "../contexts";

type MenuItemType = {
    id: string;
    name: string;
    icon: React.ReactNode;
};

type SidebarTooltip = {
    name: string;
    left: number;
    top: number;
};

type MenuButtonEvent =
    | React.FocusEvent<HTMLButtonElement>
    | React.MouseEvent<HTMLButtonElement>;

const menuItems: MenuItemType[] = [
    {
        id: "dashboard",
        name: "ภาพรวม",
        icon: <Folder className="h-5 w-5" />,
    },
    {
        id: "projects",
        name: "โครงการของฉัน",
        icon: <Building2 className="h-5 w-5" />,
    },
    {
        id: "create-project",
        name: "สร้างโครงการ",
        icon: <Plus className="h-5 w-5" />,
    },
];

export const Sidebar: React.FC = (): React.JSX.Element => {
    const {
        session,
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
        setShowCreateProjectModal,
    } = useUserDashboardContext();

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
                id="userdashboard-sidebar"
                ref={sidebarRef}
                role="navigation"
                aria-label="เมนูหลัก"
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-full transform flex-col border-r border-blue-100/70 bg-gradient-to-b from-white/98 via-white/95 to-blue-50/70 shadow-[8px_0_36px_-24px_rgba(37,99,235,0.8)] backdrop-blur-2xl transition-[width,transform] duration-300 dark:border-slate-800/80 dark:from-slate-950/98 dark:via-slate-900/95 dark:to-blue-950/35 dark:shadow-[8px_0_36px_-24px_rgba(59,130,246,0.5)] lg:translate-x-0",
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
                            <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-100 transition duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40 dark:bg-slate-800 dark:ring-blue-900/50">
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
                                    E-GRANT ONLINE
                                </h2>
                                <div className="flex items-center space-x-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <p className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-300">
                                        RHHSDI
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
                            aria-controls="userdashboard-sidebar"
                            aria-expanded={isSidebarOpen}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-600 shadow-sm shadow-blue-100/60 transition-[border-color,background-color,box-shadow,color,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:shadow-blue-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-none dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900 lg:h-9 lg:w-9"
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
                        "custom-scrollbar flex-1 overflow-y-auto px-3 py-4 xl:px-4",
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
                                        if (item.id === "create-project") {
                                            setShowCreateProjectModal(true);
                                        } else {
                                            startTransition(() => {
                                                setActiveTab(item.id);
                                            });
                                        }
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
                                            ? "border-blue-500/20 text-white shadow-lg shadow-blue-500/25"
                                            : "border-transparent text-slate-600 hover:border-blue-100 hover:bg-blue-50/70 hover:text-blue-700 dark:text-slate-300 dark:hover:border-blue-900/50 dark:hover:bg-blue-950/25 dark:hover:text-blue-300",
                                    )}
                                >
                                    {/* Active Background Gradient */}
                                    {activeTab === item.id && (
                                        <>
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
                                            <div className="absolute inset-y-2 left-1 w-1 rounded-full bg-white/85" />
                                        </>
                                    )}

                                    {/* Hover slide effect for inactive items */}
                                    {activeTab !== item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 dark:from-slate-800/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    )}

                                    <span
                                        className={cn(
                                            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105",
                                            activeTab === item.id
                                                ? "bg-white/15 text-white"
                                                : "text-slate-400 group-hover:bg-white/80 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:bg-slate-900/70 dark:group-hover:text-blue-300",
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
                    <div className="group relative overflow-hidden rounded-2xl border border-blue-100/80 bg-white/85 p-4 shadow-lg shadow-blue-100/60 backdrop-blur-xl transition duration-300 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none dark:hover:border-blue-800 dark:hover:bg-slate-900 dark:hover:shadow-blue-950/20">
                        {/* Decorativr background blur */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

                        <div className="flex items-center space-x-3 mb-3 relative z-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-100 via-indigo-50 to-white shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-800 dark:ring-slate-700">
                                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                                    {getAvatarInitial(
                                        session?.user?.name,
                                        session?.user?.email,
                                        "U",
                                    )}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                    {session?.user?.name || "ผู้ใช้"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                                    {session?.user?.email}
                                </p>
                            </div>
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
