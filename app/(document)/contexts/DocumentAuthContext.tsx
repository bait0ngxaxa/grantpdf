"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Session } from "@/lib/server/auth/types";
import { ROLES } from "@/lib/shared/constants";

interface DocumentAuthContextType {
    session: Session;
    isAdmin: boolean;
}

const DocumentAuthContext = createContext<
    DocumentAuthContextType | undefined
>(undefined);

export function DocumentAuthProvider({
    children,
    session,
}: {
    children: React.ReactNode;
    session: Session;
}): React.JSX.Element {
    const value = useMemo(
        () => ({
            session,
            isAdmin: session.user?.role === ROLES.ADMIN,
        }),
        [session],
    );

    return (
        <DocumentAuthContext.Provider value={value}>
            {children}
        </DocumentAuthContext.Provider>
    );
}

export function useDocumentAuth(): DocumentAuthContextType {
    const context = useContext(DocumentAuthContext);
    if (!context) {
        throw new Error(
            "useDocumentAuth must be used within a DocumentAuthProvider",
        );
    }
    return context;
}
