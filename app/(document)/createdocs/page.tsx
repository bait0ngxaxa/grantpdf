import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import CreateDocsClient from "./CreateDocsClient";

export default async function CreateDocsPage() {
    const session = await auth();

    if (!session) {
        redirect(ROUTES.SIGNIN);
    }

    return <CreateDocsClient />;
}
