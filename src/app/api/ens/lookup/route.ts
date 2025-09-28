import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "ENS name is required" },
        { status: 400 }
      );
    }

    // Validate ENS name format
    const ensNameRegex = /^[a-z0-9-]+$/;
    if (!ensNameRegex.test(name) || name.length < 3 || name.length > 20) {
      return NextResponse.json(
        { 
          error: "Invalid ENS name format. Must be 3-20 characters, letters, numbers, and hyphens only.",
          available: false 
        },
        { status: 400 }
      );
    }

    // Check if subdomain already exists in our database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { ensName: `${name}.ethed.eth` },
          { ensName: name }, // In case stored without domain
        ]
      }
    });

    const available = !existingUser;

    return NextResponse.json({
      name: name,
      fullName: `${name}.ethed.eth`,
      available: available,
      message: available 
        ? "ENS name is available!" 
        : "This ENS name is already taken."
    });

  } catch (error) {
    console.error("ENS availability check error:", error);
    return NextResponse.json(
      { error: "Internal server error", available: false },
      { status: 500 }
    );
  }
}