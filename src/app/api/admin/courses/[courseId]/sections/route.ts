/**
 * Admin Section Management API
 * POST   - Create a section
 * PUT    - Update/reorder sections
 * DELETE - Delete a section
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { z } from "zod";

const CreateSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

const UpdateSectionSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();
  const parse = CreateSectionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parse.error.issues },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.section.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      courseId,
      title: parse.data.title,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return NextResponse.json(section, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();

  // Batch reorder: { sections: [{id, order}] }
  if (body.sections && Array.isArray(body.sections)) {
    const updates = body.sections.map((s: { id: string; order: number }) =>
      prisma.section.update({ where: { id: s.id }, data: { order: s.order } })
    );
    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Sections reordered" });
  }

  const parse = UpdateSectionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parse.error.issues },
      { status: 400 }
    );
  }

  const { sectionId, ...updates } = parse.data;
  const section = await prisma.section.update({
    where: { id: sectionId },
    data: {
      ...(updates.title && { title: updates.title }),
      ...(updates.order !== undefined && { order: updates.order }),
    },
  });

  return NextResponse.json(section);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("id");
  if (!sectionId) {
    return NextResponse.json({ error: "Section ID required" }, { status: 400 });
  }

  // Delete section and move its lessons to unsectioned
  await prisma.section.delete({
    where: { id: sectionId },
  });

  return NextResponse.json({ message: "Section deleted" });
}
