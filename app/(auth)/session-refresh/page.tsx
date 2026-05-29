import SessionRefreshClient from "./SessionRefreshClient";

interface SessionRefreshPageProps {
    searchParams: Promise<{
        callbackUrl?: string;
    }>;
}

export default async function SessionRefreshPage({
    searchParams,
}: SessionRefreshPageProps): Promise<React.JSX.Element> {
    const params = await searchParams;
    return <SessionRefreshClient callbackUrl={params.callbackUrl} />;
}
