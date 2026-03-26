/**
 * Admin Lesson Management API
 * GET    /api/admin/courses/[courseId]/lessons  — list lessons for a course
 * POST   /api/admin/courses/[courseId]/lessons  — create a lesson
 * PUT    /api/admin/courses/[courseId]/lessons  — update a lesson (body: lessonId + fields)
 * DELETE /api/admin/courses/[courseId]/lessons?id=xxx — delete a lesson
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { createAuditLog } from "@/lib/middleware/auditLog";
import { z } from "zod";

const LessonCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().optional(),
  sectionId: z.string().optional(),
  duration: z.number().int().positive().optional(),
});

const LessonUpdateSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(3).optional(),
  content: z.string().optional(),
  sectionId: z.string().nullable().optional(),
  duration: z.number().int().positive().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      level: true,
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              content: true,
              duration: true,
              order: true,
              contentBlocks: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  type: true,
                  order: true,
                  textContent: true,
                  videoUrl: true,
                  codeLanguage: true,
                  quizData: true,
                },
              },
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      lessons: {
        where: { sectionId: null },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          duration: true,
          order: true,
          contentBlocks: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              type: true,
              order: true,
              textContent: true,
              videoUrl: true,
              codeLanguage: true,
              quizData: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const actorId = await requireAdmin();
  if (actorId instanceof Response) return actorId as any;

  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();
  const parse = LessonCreateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parse.error.issues },
      { status: 400 }
    );
  }

  // Verify section exists if provided
  if (parse.data.sectionId) {
    const section = await prisma.section.findFirst({
      where: { id: parse.data.sectionId, courseId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
  }

  const maxOrder = await prisma.lesson.aggregate({
    where: { courseId, sectionId: parse.data.sectionId || null },
    _max: { order: true },
  });

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title: parse.data.title,
      content: parse.data.content || null,
      sectionId: parse.data.sectionId || null,
      duration: parse.data.duration ?? null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  await createAuditLog({
    actorId,
    action: "LESSON_CREATED",
    targetId: lesson.id,
    targetType: "Lesson",
    metadata: { title: lesson.title, courseId, courseTitle: course.title },
  });

  return NextResponse.json(lesson, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const actorId = await requireAdmin();
  if (actorId instanceof Response) return actorId as any;

  const { courseId } = await params;

  const body = await request.json();
  const parse = LessonUpdateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parse.error.issues },
      { status: 400 }
    );
  }

  const { lessonId, title, content, sectionId, duration, order } = parse.data;

  // Ensure lesson belongs to this course
  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Verify section exists if provided
  if (sectionId !== undefined && sectionId !== null) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, courseId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
  }

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(sectionId !== undefined && { sectionId }),
      ...(duration !== undefined && { duration }),
      ...(order !== undefined && { order }),
    },
  });

  await createAuditLog({
    actorId,
    action: "LESSON_UPDATED",
    targetId: lessonId,
    targetType: "Lesson",
    metadata: { title: lesson.title, courseId, changes: { title, content: content !== undefined, duration } },
  });

  return NextResponse.json(lesson);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const actorId = await requireAdmin();
  if (actorId instanceof Response) return actorId as any;

  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("id");

  if (!lessonId) {
    return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
  }

  // Ensure lesson belongs to this course
  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  await prisma.lesson.delete({ where: { id: lessonId } });

  await createAuditLog({
    actorId,
    action: "LESSON_DELETED",
    targetId: lessonId,
    targetType: "Lesson",
    metadata: { title: existing.title, courseId },
  });

  return NextResponse.json({ message: "Lesson deleted" });
}
