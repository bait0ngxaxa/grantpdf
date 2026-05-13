import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { type Metadata } from "next";
import SigninClient from "./SigninClient";

export const metadata: Metadata = {
    title: "เข้าสู่ระบบ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

interface LoginPageProps {
    searchParams?: Promise<{
        callbackUrl?: string;
        reason?: string;
    }>;
}

function getSafeCallbackUrl(callbackUrl: string | undefined): string | undefined {
    if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
        return undefined;
    }

    return callbackUrl;
}

export default async function LoginPage({
    searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
    const session = await auth();
    const params = await searchParams;
    const callbackUrl = getSafeCallbackUrl(params?.callbackUrl);

    if (session) {
        redirect(callbackUrl ?? ROUTES.DASHBOARD);
    }

    return <SigninClient callbackUrl={callbackUrl} reason={params?.reason} />;
}
