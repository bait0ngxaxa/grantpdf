"use client";

import { useGlobalModalContext } from "@/components/providers/GlobalModalContext";

export function useGlobalModal() {
    return useGlobalModalContext();
}
