import React from "react";
import {
    Building2,
    ClipboardCheck,
    Database,
    GraduationCap,
    Handshake,
    HeartPulse,
} from "lucide-react";
import type { ProgramAccentKey } from "@/components/programAccent";

const PROGRAM_ICONS: Record<ProgramAccentKey, React.ElementType> = {
    sip: Handshake,
    "dm-hub": Database,
    teacher: GraduationCap,
    vbhc: HeartPulse,
    icap: ClipboardCheck,
    spb: Building2,
};

export function ProgramIdentityIcon({
    accentKey,
    className = "h-5 w-5",
}: {
    accentKey: ProgramAccentKey;
    className?: string;
}): React.JSX.Element {
    const Icon = PROGRAM_ICONS[accentKey];
    return <Icon className={className} />;
}
