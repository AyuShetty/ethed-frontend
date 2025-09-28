import LessonViewer from '@/components/LessonViewer';

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  return <LessonViewer moduleId={lessonId} />;
}