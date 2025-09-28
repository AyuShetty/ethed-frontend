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

    // Clean the name input (remove spaces, convert to lowercase)
    const cleanName = name.trim().toLowerCase();

    // Updated ENS name validation - allow underscores and be more flexible
    const ensNameRegex = /^[a-z0-9_-]+$/;
    if (!ensNameRegex.test(cleanName) || cleanName.length < 3 || cleanName.length > 20) {
      return NextResponse.json(
        { 
          error: "Invalid ENS name format. Must be 3-20 characters, lowercase letters, numbers, hyphens, and underscores only.",
          available: false 
        },
        { status: 400 }
      );
    }

    // Check for reserved names
    const reservedNames = ['admin', 'api', 'www', 'mail', 'support', 'help', 'ethed', 'eth', 'ethereum'];
    if (reservedNames.includes(cleanName)) {
      return NextResponse.json({
        name: cleanName,
        fullName: `${cleanName}.ethed.eth`,
        available: false,
        message: "This ENS name is reserved and cannot be used."
      });
    }

    // Check if subdomain already exists in the WalletAddress table
    const existingWallet = await prisma.walletAddress.findFirst({
      where: {
        OR: [
          { ensName: `${cleanName}.ethed.eth` },
          { ensName: cleanName }, // In case stored without domain
        ]
      }
    });

    const available = !existingWallet;

    return NextResponse.json({
      name: cleanName,
      fullName: `${cleanName}.ethed.eth`,
      available: available,
      message: available 
        ? "ENS name is available!" 
        : "This ENS name is already taken."
    });

  } catch (error) {
    console.error("ENS availability check error:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to check ENS availability. Please try again.", 
        available: false 
      },
      { status: 500 }
    );
  }
}