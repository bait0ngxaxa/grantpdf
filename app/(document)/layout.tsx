import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";
import {
    AuthRefreshProvider,
    GlobalModalProvider,
    SWRProvider,
} from "@/components/providers";
import { DocumentAuthProvider } from "./contexts/DocumentAuthContext";

export default async function DocumentLayout({
    children,
}: {
    children: React.ReactNode;
}): Promise<React.JSX.Element> {
    const session = await auth();

    if (!session) {
        redirect(ROUTES.SIGNIN);
    }

    return (
        <DocumentAuthProvider session={session}>
            <SWRProvider>
                <AuthRefreshProvider shouldRefresh={true} />
                <GlobalModalProvider>{children}</GlobalModalProvider>
            </SWRProvider>
        </DocumentAuthProvider>
    );
}
