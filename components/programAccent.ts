type ProgramAccentInput = {
    id: string;
    name: string;
};

export type ProgramAccent = {
    key: ProgramAccentKey;
    card: string;
    panel: string;
    icon: string;
    text: string;
    dot: string;
    hoverShadow: string;
};

export type ProgramAccentKey =
    | "sip"
    | "dm-hub"
    | "teacher"
    | "vbhc"
    | "icap"
    | "spb";

const PROGRAM_ACCENTS: ProgramAccent[] = [
    {
        key: "sip",
        card: "border-slate-200 bg-white hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-700",
        panel: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
        icon: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/40",
        text: "text-sky-700 dark:text-sky-300",
        dot: "bg-sky-500",
        hoverShadow: "hover:shadow-sky-100/80 dark:hover:shadow-sky-950/20",
    },
    {
        key: "dm-hub",
        card: "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-emerald-700",
        panel: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
        icon: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/40",
        text: "text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
        hoverShadow: "hover:shadow-emerald-100/80 dark:hover:shadow-emerald-950/20",
    },
    {
        key: "teacher",
        card: "border-slate-200 bg-white hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-amber-700",
        panel: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
        icon: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
        hoverShadow: "hover:shadow-amber-100/80 dark:hover:shadow-amber-950/20",
    },
    {
        key: "vbhc",
        card: "border-slate-200 bg-white hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-rose-700",
        panel: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
        icon: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/40",
        text: "text-rose-700 dark:text-rose-300",
        dot: "bg-rose-500",
        hoverShadow: "hover:shadow-rose-100/80 dark:hover:shadow-rose-950/20",
    },
    {
        key: "icap",
        card: "border-slate-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-violet-700",
        panel: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
        icon: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/40",
        text: "text-violet-700 dark:text-violet-300",
        dot: "bg-violet-500",
        hoverShadow: "hover:shadow-violet-100/80 dark:hover:shadow-violet-950/20",
    },
    {
        key: "spb",
        card: "border-slate-200 bg-white hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-teal-700",
        panel: "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
        icon: "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/40",
        text: "text-teal-700 dark:text-teal-300",
        dot: "bg-teal-500",
        hoverShadow: "hover:shadow-teal-100/80 dark:hover:shadow-teal-950/20",
    },
];

const KNOWN_PROGRAM_GROUPS = [
    "SIP",
    "DM HUB",
    "ครูนางฟ้า",
    "VBHC1-3",
    "ICAP",
    "สพบ",
] as const;

function getProgramKey(program: ProgramAccentInput): string {
    const name = program.name.trim().toUpperCase();
    if (name.includes("SIP")) return "SIP";
    if (name.includes("DM HUB")) return "DM HUB";
    if (program.name.includes("ครูนางฟ้า")) return "ครูนางฟ้า";
    if (/\bVBHC\s*[1-3]\b/.test(name) || /\bVBHC[1-3]\b/.test(name)) {
        return "VBHC1-3";
    }
    if (name.includes("ICAP")) return "ICAP";
    if (program.name.includes("สพบ")) return "สพบ";
    return name || program.id;
}

export function getProgramAccent(
    program: ProgramAccentInput,
): ProgramAccent {
    const key = getProgramKey(program);
    const knownIndex = KNOWN_PROGRAM_GROUPS.findIndex((group) => group === key);
    if (knownIndex >= 0) return PROGRAM_ACCENTS[knownIndex];

    const total = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return PROGRAM_ACCENTS[total % PROGRAM_ACCENTS.length];
}
