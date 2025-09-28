import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma-client";
import { getAddress } from "viem";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallets: {
          orderBy: { isPrimary: 'desc' }
        },
        pets: {
          orderBy: { createdAt: 'desc' }
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                level: true
              }
            }
          },
          orderBy: { startedAt: 'desc' }
        },
        _count: {
          select: {
            courses: true,
            purchases: true,
            nfts: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        wallets: user.wallets,
        pets: user.pets,
        courses: user.courses,
        stats: {
          coursesEnrolled: user._count.courses,
          purchasesMade: user._count.purchases,
          nftsOwned: user._count.nfts
        }
      }
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image, primaryWallet } = body;

    const updates: any = {};
    
    if (name !== undefined) {
      updates.name = name;
    }
    
    if (image !== undefined) {
      updates.image = image;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      include: {
        wallets: true
      }
    });

    // Update primary wallet if specified
    if (primaryWallet && user.wallets.length > 0) {
      await prisma.walletAddress.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      });

      await prisma.walletAddress.update({
        where: { id: primaryWallet },
        data: { isPrimary: true }
      });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}