// เส้นแสดง dashboard user ทั่วไป
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";



export async function GET(req: Request) {
  try {
    // Get the authenticated user's session
    // This is the correct way to get the session in an App Router API Route
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      // Return an Unauthorized response if there is no session or user ID
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert the user ID to a BigInt if your database uses it
    // If your user ID is a string, you can use it directly
    const userId = Number(session.user.id);

    // Query the database for all user files belonging to this user ID
    const userFiles = await prisma.userFile.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        originalFileName: true,
        storagePath: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Convert BigInt IDs to strings to prevent JSON serialization errors
    const sanitizedFiles = userFiles.map((file) => ({
      ...file,
      id: file.id.toString(),
    }));

    return NextResponse.json(sanitizedFiles, { status: 200 });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch user documents" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
