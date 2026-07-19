import { NextResponse } from "next/server";
import { checkRedisHealth } from "@/lib/server/db";

export async function GET(): Promise<NextResponse> {
    const redis = await checkRedisHealth();
    const isHealthy = redis.status === "healthy" || redis.status === "disabled";

    return NextResponse.json(
        { redis },
        {
            status: isHealthy ? 200 : 503,
            headers: { "Cache-Control": "no-store" },
        },
    );
}
