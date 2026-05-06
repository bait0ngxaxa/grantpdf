import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed 8 parent programs. Uses upsert (by unique name) for idempotency —
 * safe to re-run without creating duplicates.
 */
const PROGRAMS = [
    { name: "SIP To (getter)", sortOrder: 1 },
    { name: "DM Hub", sortOrder: 2 },
    { name: "ครูนางฟ้า", sortOrder: 3 },
    { name: "VBHC1(policy)", sortOrder: 4 },
    { name: "VBHC2(รพ.สต.ถ่ายโอน)", sortOrder: 5 },
    { name: "VBHC3(PROM)", sortOrder: 6 },
    { name: "ICAP", sortOrder: 7 },
    { name: "สพบ", sortOrder: 8 },
] as const;

async function main(): Promise<void> {
    console.log("Seeding programs...");

    for (const program of PROGRAMS) {
        await prisma.program.upsert({
            where: { name: program.name },
            update: { sortOrder: program.sortOrder },
            create: {
                name: program.name,
                sortOrder: program.sortOrder,
                isActive: true,
            },
        });
        console.log(`  ✓ ${program.name}`);
    }

    console.log(`Seeded ${PROGRAMS.length} programs successfully.`);
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
