import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardClient from "./UserDashboardClient";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/signin");
    }

    return <UserDashboardClient />;
}
