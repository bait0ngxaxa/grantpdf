import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import CreateDocsClient from "./CreateDocsClient";

export default async function CreateDocsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(ROUTES.SIGNIN);
    }

    return <CreateDocsClient />;
}
