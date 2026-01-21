"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

export const SWRProvider = ({ children }: { children: ReactNode }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (resource, init) =>
                    fetch(resource, init).then((res) => {
                        if (!res.ok) {
                            throw new Error("Failed to fetch data");
                        }
                        return res.json();
                    }),
                revalidateOnFocus: true,
                dedupingInterval: 5000,
            }}
        >
            {children}
        </SWRConfig>
    );
};
