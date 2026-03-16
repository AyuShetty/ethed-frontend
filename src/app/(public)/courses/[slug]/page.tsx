import { prisma } from "@/lib/prisma-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

const LEVEL_MAP: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function DynamicCoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      lessons: {
        orderBy: [
          { order: "asc" },
          { createdAt: "asc" },
        ],
      },
      _count: { select: { users: true } },
    },
  });

  if (!course) notFound();

  const level = LEVEL_MAP[course.level] ?? "Beginner";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </Link>
        </Button>

        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary">{level}</Badge>
              <Badge variant="outline">Published</Badge>
            </div>
            <CardTitle className="text-3xl leading-tight">{course.title}</CardTitle>
            <CardDescription className="text-base mt-2">{course.description || "No description provided."}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.lessons.length} lessons
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course._count.users} students
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {course.lessons.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center text-muted-foreground">
                No lessons have been added yet.
              </CardContent>
            </Card>
          ) : (
            course.lessons.map((lesson, idx) => (
              <Card key={lesson.id} className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">Lesson {idx + 1}: {lesson.title}</CardTitle>
                    <span className="inline-flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {lesson.duration ? `${lesson.duration} mins` : "10 mins"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                    {lesson.content || "No lesson content yet."}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
