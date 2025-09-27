"use server";

import { prisma } from "@/lib/prisma-client";
import { ApiResponse } from "@/lib/types";
import { CourseCreateSchema, CourseCreateInput } from "@/lib/zodSchemas";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CourseLevel } from "@/generated/prisma";

export async function createCourse(formData: FormData): Promise<ApiResponse> {
  try {
    // 1. Authentication check
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required. Please log in to continue.",
      };
    }

    // 2. Extract and validate form data properly
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      fileKey: formData.get("fileKey") as string,
      price: Number(formData.get("price")),
      duration: Number(formData.get("duration")),
      level: formData.get("level") as string,
      category: formData.get("category") as string,
      smallDescription: formData.get("smallDescription") as string,
      slug: formData.get("slug") as string,
      status: formData.get("status") as string,
    };

    // 3. Validate with Zod schema
    const validation = CourseCreateSchema.safeParse(rawData);
    if (!validation.success) {
      const errors = validation.error.issues
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return {
        status: "error",
        message: `Validation failed: ${errors}`,
      };
    }

    const validatedData = validation.data;

    // 4. Check if slug is unique
    const existingCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: validatedData.slug },
          { 
            title: validatedData.title,
            userId: session.user.id // Only check for same user
          }
        ]
      }
    });

    if (existingCourse) {
      return {
        status: "error",
        message: existingCourse.slug === validatedData.slug 
          ? "A course with this URL slug already exists. Please choose a different one."
          : "You already have a course with this title. Please choose a different title.",
      };
    }

    // 5. Validate file URL if provided
    if (validatedData.fileKey) {
      try {
        new URL(validatedData.fileKey);
      } catch {
        return {
          status: "error",
          message: "Invalid thumbnail URL. Please upload a valid image.",
        };
      }
    }

    // 6. Create course with transaction for data integrity
    const course = await prisma.$transaction(async (tx) => {
      // Create the course
      const newCourse = await tx.course.create({
        data: {
          ...validatedData,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
        }
      });

      return newCourse;
    });

    // 7. Revalidate related paths for cache invalidation
    revalidatePath("/admin/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/courses"); // Course listing page

    return {
      status: "success",
      message: "Course created successfully!",
      data: {
        id: course.id,
        slug: course.slug,
        title: course.title,
      },
    };

  } catch (error) {
    console.error("Course creation error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          status: "error",
          message: "A course with this information already exists. Please modify your inputs.",
        };
      }
      
      if (error.message.includes("Foreign key constraint")) {
        return {
          status: "error",
          message: "Invalid reference data. Please refresh the page and try again.",
        };
      }

      if (error.message.includes("timeout")) {
        return {
          status: "error",
          message: "Request timed out. Please try again.",
        };
      }
    }

    return {
      status: "error",
      message: "Failed to create course. Please try again later.",
    };
  }
}

// Helper action to check slug availability in real-time
export async function checkSlugAvailability(slug: string): Promise<{ available: boolean; suggestion?: string }> {
  try {
    if (!slug || slug.length < 3) {
      return { available: false };
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingCourse = await prisma.course.findUnique({
      where: { slug: cleanSlug },
      select: { id: true },
    });

    if (existingCourse) {
      // Generate a suggestion
      const suggestion = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
      return { available: false, suggestion };
    }

    return { available: true };
  } catch (error) {
    console.error("Slug availability check error:", error);
    return { available: false };
  }
}

// Helper action to generate unique slug
export async function generateUniqueSlug(title: string): Promise<{ slug: string }> {
  try {
    if (!title || title.length < 3) {
      return { slug: `course-${Date.now()}` };
    }

    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure slug isn't too long
    if (baseSlug.length > 50) {
      baseSlug = baseSlug.substring(0, 50).replace(/-+$/, "");
    }

    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists and increment until we find a unique one
    while (counter < 100) { // Prevent infinite loops
      const existing = await prisma.course.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return { slug };
  } catch (error) {
    console.error("Slug generation error:", error);
    return { slug: `course-${Date.now()}` };
  }
}

// Save draft functionality - FIXED VERSION
export async function saveDraft(formData: FormData): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required.",
      };
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      fileKey: formData.get("fileKey") as string,
      price: Number(formData.get("price")) || 0,
      duration: Number(formData.get("duration")) || 0,
      level: formData.get("level") as string || "BEGINNER",
      category: formData.get("category") as string,
      smallDescription: formData.get("smallDescription") as string,
      slug: formData.get("slug") as string,
      status: "DRAFT",
    };

    // For drafts, we allow partial validation
    if (!rawData.title || rawData.title.length < 3) {
      return {
        status: "error",
        message: "Title is required to save draft (minimum 3 characters).",
      };
    }

    // Generate slug if not provided
    let slugToUse = rawData.slug;
    if (!slugToUse || slugToUse.length < 3) {
      const { slug: generatedSlug } = await generateUniqueSlug(rawData.title);
      slugToUse = generatedSlug;
    }

    // Clean the data for draft
    const draftData = {
      title: rawData.title,
      description: rawData.description || "",
      fileKey: rawData.fileKey || "",
      price: rawData.price,
      duration: rawData.duration,
      level: rawData.level as CourseLevel,
      category: rawData.category || "",
      smallDescription: rawData.smallDescription || "",
      slug: slugToUse,
      status: "DRAFT" as const,
      userId: session.user.id,
    };

    // Try to find existing draft by title and user (safer approach)
    const existingDraft = await prisma.course.findFirst({
      where: {
        title: draftData.title,
        userId: session.user.id,
        status: "DRAFT",
      },
      select: {
        id: true,
        slug: true,
      }
    });

    let draft;

    if (existingDraft) {
      // Update existing draft
      draft = await prisma.course.update({
        where: {
          id: existingDraft.id,
        },
        data: {
          ...draftData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          slug: true,
        }
      });
    } else {
      // Create new draft - but first check if slug is available
      const slugExists = await prisma.course.findUnique({
        where: { slug: slugToUse },
        select: { id: true }
      });

      if (slugExists) {
        // Generate a new unique slug for the draft
        const { slug: uniqueSlug } = await generateUniqueSlug(draftData.title);
        draftData.slug = uniqueSlug;
      }

      draft = await prisma.course.create({
        data: {
          ...draftData,
          level: draftData.level as CourseLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          slug: true,
        }
      });
    }

    // Revalidate paths
    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Draft saved successfully!",
      data: { 
        id: draft.id,
        title: draft.title,
        slug: draft.slug,
      }
    };

  } catch (error) {
    console.error("Draft save error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          status: "error",
          message: "A course with this slug already exists. Please try again.",
        };
      }
      
      if (error.message.includes("Foreign key constraint")) {
        return {
          status: "error",
          message: "Invalid user reference. Please refresh and try again.",
        };
      }
    }

    return {
      status: "error",
      message: "Failed to save draft. Please try again.",
    };
  }
}

// Additional helper function to get user's drafts
export async function getUserDrafts(): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required.",
      };
    }

    const drafts = await prisma.course.findMany({
      where: {
        userId: session.user.id,
        status: "DRAFT",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      status: "success",
      message: "Drafts retrieved successfully",
      data: drafts,
    };
  } catch (error) {
    console.error("Get drafts error:", error);
    return {
      status: "error",
      message: "Failed to retrieve drafts.",
    };
  }
}

// Helper function to delete a draft
export async function deleteDraft(draftId: string): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required.",
      };
    }

    // Verify the draft belongs to the user and is actually a draft
    const draft = await prisma.course.findFirst({
      where: {
        id: draftId,
        userId: session.user.id,
        status: "DRAFT",
      },
    });

    if (!draft) {
      return {
        status: "error",
        message: "Draft not found or you don't have permission to delete it.",
      };
    }

    await prisma.course.delete({
      where: {
        id: draftId,
      },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Draft deleted successfully!",
    };
  } catch (error) {
    console.error("Delete draft error:", error);
    return {
      status: "error",
      message: "Failed to delete draft.",
    };
  }
}