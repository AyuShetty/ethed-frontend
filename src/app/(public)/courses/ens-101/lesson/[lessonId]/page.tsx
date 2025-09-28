import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component
const ENSLessonClient = dynamic(() => import('./client'), {
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading lesson...</div>
});

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function ENSLessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>}>
      <ENSLessonClient lessonId={lessonId} />
    </Suspense>
  );
}
