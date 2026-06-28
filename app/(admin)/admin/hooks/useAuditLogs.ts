import { useCallback, useDeferredValue, useMemo, useState } from "react";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/shared/constants";
import type { AuditLogsApiResponse } from "@/type/api";

interface AuditLogFilters {
    search: string;
    action: string;
    outcome: "" | "success" | "failure";
    date: string;
}

export interface UseAuditLogsResult {
    logs: AuditLogsApiResponse["logs"];
    total: number;
    totalPages: number;
    page: number;
    isLoading: boolean;
    errorMessage: string | null;
    filters: AuditLogFilters;
    setPage: (page: number) => void;
    setSearch: (value: string) => void;
    setAction: (value: string) => void;
    setOutcome: (value: "" | "success" | "failure") => void;
    setDate: (value: string) => void;
    refresh: () => Promise<AuditLogsApiResponse | undefined>;
}

const LIMIT = 20;

export function useAuditLogs(): UseAuditLogsResult {
    const [page, setPageState] = useState(1);
    const [search, setSearchState] = useState("");
    const [action, setActionState] = useState("");
    const [outcome, setOutcomeState] = useState<"" | "success" | "failure">("");
    const [date, setDateState] = useState("");
    const deferredSearch = useDeferredValue(search);

    const setPage = useCallback((nextPage: number) => {
        setPageState(nextPage);
    }, []);

    const setSearch = useCallback((value: string) => {
        setSearchState(value);
        setPageState(1);
    }, []);

    const setAction = useCallback((value: string) => {
        setActionState(value);
        setPageState(1);
    }, []);

    const setOutcome = useCallback((value: "" | "success" | "failure") => {
        setOutcomeState(value);
        setPageState(1);
    }, []);

    const setDate = useCallback((value: string) => {
        setDateState(value);
        setPageState(1);
    }, []);

    const key = useMemo(() => {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (deferredSearch.trim()) params.set("search", deferredSearch.trim());
        if (action) params.set("action", action);
        if (outcome) params.set("outcome", outcome);
        if (date) params.set("date", date);

        return `${API_ROUTES.ADMIN_AUDIT}?${params.toString()}`;
    }, [page, deferredSearch, action, outcome, date]);

    const { data, error, isLoading, mutate } = useSWR<AuditLogsApiResponse>(key, {
        keepPreviousData: true,
    });

    return {
        logs: data?.logs ?? [],
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 0,
        page,
        isLoading,
        errorMessage: error ? "ไม่สามารถโหลด Audit Logs ได้" : null,
        filters: { search, action, outcome, date },
        setPage,
        setSearch,
        setAction,
        setOutcome,
        setDate,
        refresh: async () => mutate(),
    };
}
