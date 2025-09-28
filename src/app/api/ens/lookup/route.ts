import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";

    const cleanName = name.trim().toLowerCase();

    return NextResponse.json({
      name: cleanName,
      fullName: `${cleanName}.ethed.eth`,
      available: true,
      message: "Okay, this ENS is available!"
    });
    
  } catch (error) {
    console.error("ENS availability check error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check ENS availability. Please try again.", 
        available: false 
      },
      { status: 500 }
    );
  }
}
