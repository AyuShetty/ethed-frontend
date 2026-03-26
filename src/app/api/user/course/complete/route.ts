import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { addXpAndProgress } from "@/lib/gamification";
import { HttpStatus } from "@/lib/api-response";
import { logger } from "@/lib/monitoring";
import arcjet, { shield, slidingWindow } from "@/lib/arcjet";
import { sendCourseCompletionEmail } from "@/lib/emails/courseCompletion";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });
    }

    const decision = await arcjet
      .withRule(
        slidingWindow({
          mode: "LIVE",
          interval: "1m",
          max: 5, // Max 5 completions per minute
        })
      )
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: HttpStatus.RATE_LIMITED }
      );
    }

    const body = await request.json();
    const { courseSlug, quizPassed, quizScore } = body;
    if (!courseSlug) {
      return NextResponse.json({ error: "Missing courseSlug" }, { status: HttpStatus.BAD_REQUEST });
    }

    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: HttpStatus.NOT_FOUND });
    }

    // Get existing progress to check completion state
    const existingProgress = await prisma.userCourse.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } }
    });

    // 1. VALIDATION: Check if course was already completed
    if (existingProgress?.completed) {
      logger.warn(
        `User ${session.user.id} attempted to complete already-completed course ${courseSlug}`,
        "course-api",
        { userId: session.user.id, courseSlug, alreadyCompleted: true }
      );
      return NextResponse.json(
        { success: true, message: "Course already completed", userCourse: existingProgress },
        { status: HttpStatus.OK } // Return OK to be idempotent, but don't re-award XP
      );
    }

    // 2. VALIDATION: Verify quiz requirement if provided
    if (quizPassed === false) {
      logger.warn(
        `User ${session.user.id} cannot complete course ${courseSlug} - quiz not passed (score: ${quizScore})`,
        "course-api",
        { userId: session.user.id, courseSlug, quizScore }
      );
      return NextResponse.json(
        { success: false, error: "Quiz must be passed to complete course", quizScore },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (quizPassed === true && typeof quizScore !== 'number') {
      return NextResponse.json(
        { success: false, error: "Invalid quiz data" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // 3. Mark completion in DB
    const userCourse = await prisma.userCourse.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      update: {
        progress: 100,
        completed: true,
        quizPassed: quizPassed ?? null,
        quizScore: quizScore ?? null,
        finishedAt: new Date()
      },
      create: {
        userId: session.user.id,
        courseId: course.id,
        progress: 100,
        completed: true,
        quizPassed: quizPassed ?? null,
        quizScore: quizScore ?? null,
        finishedAt: new Date()
      }
    });

    // 4. Award XP and update levels (Standard Lesson XP + 50 Bonus for course completion)
    const bonusXp = 50;
    const totalXpAwarded = 10 + bonusXp; // 10 for the final module + 50 for the course
    await addXpAndProgress(session.user.id, undefined, totalXpAwarded);

    // 5. Send completion email
    const wasAlreadyCompleted = existingProgress?.completed;
    if (!wasAlreadyCompleted && session.user.email && process.env.EMAIL_HOST) {
      sendCourseCompletionEmail({
        to: session.user.email,
        userName: session.user.name ?? 'Learner',
        courseName: course.title,
        courseSlug: course.slug,
        xpAwarded: totalXpAwarded,
      }).catch(err => logger.warn('Course completion email failed', 'email', { error: String(err) }));
    }

    logger.info(`User ${session.user.id} completed course ${courseSlug}`, "course-api", {
      userId: session.user.id,
      courseSlug,
      quizPassed,
      quizScore,
      xpAwarded: totalXpAwarded
    });

    return NextResponse.json({
      success: true,
      message: "Course marked complete",
      userCourse,
      xpAwarded: totalXpAwarded
    });
  } catch (error) {
    logger.error(`Course completion error`, "course-api", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
