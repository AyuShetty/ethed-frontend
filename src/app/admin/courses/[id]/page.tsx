'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  FileText,
  Film,
  GripVertical,
  HelpCircle,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ContentBlock {
  id: string;
  type: 'TEXT' | 'VIDEO' | 'YOUTUBE' | 'CODE' | 'QUIZ';
  order: number;
  textContent: string | null;
  videoUrl: string | null;
  codeLanguage: string | null;
  quizData: unknown;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  order: number;
  duration: number | null;
  sectionId: string | null;
  contentBlocks: ContentBlock[];
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  level: string;
  sections: Section[];
  lessons: Lesson[];
}

interface QuizQuestionDraft {
  id: string;
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

interface QuizDraft {
  passingScore: number;
  questions: QuizQuestionDraft[];
}

const blockTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  TEXT: { label: 'Text / Markdown', icon: FileText, color: 'text-blue-400' },
  VIDEO: { label: 'Video Upload', icon: Film, color: 'text-purple-400' },
  YOUTUBE: { label: 'YouTube Embed', icon: Youtube, color: 'text-red-400' },
  CODE: { label: 'Code Snippet', icon: Code, color: 'text-emerald-400' },
  QUIZ: { label: 'Quiz', icon: HelpCircle, color: 'text-amber-400' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-amber-500/10 text-amber-400 border-amber-400/20' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', className: 'bg-blue-500/10 text-blue-400 border-blue-400/20' },
  PUBLISHED: { label: 'Published', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' },
  REJECTED: { label: 'Needs Revision', className: 'bg-red-500/10 text-red-400 border-red-400/20' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-500/10 text-slate-300 border-slate-400/20' },
};

function emptyQuestion(): QuizQuestionDraft {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
  };
}

function emptyQuizDraft(): QuizDraft {
  return {
    passingScore: 70,
    questions: [emptyQuestion()],
  };
}

function normalizeQuizData(raw: unknown): QuizDraft {
  if (!raw || typeof raw !== 'object') return emptyQuizDraft();

  const quizObj = raw as { passingScore?: unknown; questions?: unknown };
  const passingScore = typeof quizObj.passingScore === 'number' && Number.isFinite(quizObj.passingScore)
    ? Math.max(1, Math.min(100, Math.floor(quizObj.passingScore)))
    : 70;

  const rawQuestions = Array.isArray(quizObj.questions) ? quizObj.questions : [];
  const mapped = rawQuestions.map((q, index) => {
    const questionObj = (q && typeof q === 'object') ? q as {
      question?: unknown;
      options?: unknown;
      correct?: unknown;
      explanation?: unknown;
    } : {};

    const options = Array.isArray(questionObj.options)
      ? [
          String(questionObj.options[0] ?? ''),
          String(questionObj.options[1] ?? ''),
          String(questionObj.options[2] ?? ''),
          String(questionObj.options[3] ?? ''),
        ] as [string, string, string, string]
      : ['', '', '', ''] as [string, string, string, string];

    const correct = typeof questionObj.correct === 'number' && questionObj.correct >= 0 && questionObj.correct <= 3
      ? Math.floor(questionObj.correct)
      : 0;

    return {
      id: `q-${index}-${Math.random().toString(36).slice(2, 8)}`,
      question: String(questionObj.question ?? ''),
      options,
      correct,
      explanation: String(questionObj.explanation ?? ''),
    };
  });

  return {
    passingScore,
    questions: mapped.length > 0 ? mapped : [emptyQuestion()],
  };
}

function buildQuizPayload(draft: QuizDraft) {
  const normalizedQuestions = draft.questions
    .map((question) => ({
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()),
      correct: question.correct,
      explanation: question.explanation.trim(),
    }))
    .filter((question) => question.question.length > 0 || question.options.some((option) => option.length > 0));

  return {
    passingScore: Math.max(1, Math.min(100, Math.floor(draft.passingScore))),
    questions: normalizedQuestions,
  };
}

export default function AdminCourseEditorPage() {
  const { id: courseId } = useParams<{ id: string }>();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderingKey, setReorderingKey] = useState<string | null>(null);

  const [sectionDialog, setSectionDialog] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [creatingSection, setCreatingSection] = useState(false);

  const [lessonDialog, setLessonDialog] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSectionId, setLessonSectionId] = useState('none');
  const [lessonDuration, setLessonDuration] = useState('');
  const [creatingLesson, setCreatingLesson] = useState(false);

  const [blockDialog, setBlockDialog] = useState(false);
  const [blockLessonId, setBlockLessonId] = useState('');
  const [blockType, setBlockType] = useState('TEXT');
  const [blockText, setBlockText] = useState('');
  const [blockVideoUrl, setBlockVideoUrl] = useState('');
  const [blockCodeLang, setBlockCodeLang] = useState('javascript');
  const [blockQuizData, setBlockQuizData] = useState('');
  const [blockQuizMode, setBlockQuizMode] = useState<'builder' | 'json'>('builder');
  const [blockQuizBuilder, setBlockQuizBuilder] = useState<QuizDraft>(emptyQuizDraft());
  const [creatingBlock, setCreatingBlock] = useState(false);
  const [uploadingBlockVideo, setUploadingBlockVideo] = useState(false);

  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);
  const [editBlockText, setEditBlockText] = useState('');
  const [editBlockVideoUrl, setEditBlockVideoUrl] = useState('');
  const [editBlockCodeLang, setEditBlockCodeLang] = useState('javascript');
  const [editBlockQuizData, setEditBlockQuizData] = useState('');
  const [editQuizMode, setEditQuizMode] = useState<'builder' | 'json'>('builder');
  const [editQuizBuilder, setEditQuizBuilder] = useState<QuizDraft>(emptyQuizDraft());
  const [savingBlock, setSavingBlock] = useState(false);
  const [uploadingEditVideo, setUploadingEditVideo] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'section' | 'lesson' | 'block';
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const addVideoInputRef = useRef<HTMLInputElement | null>(null);
  const editVideoInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`);
      if (!response.ok) throw new Error('Failed to load course');

      const data = await response.json();
      setCourse(data);

      const flatLessons = [
        ...(data.lessons ?? []),
        ...((data.sections ?? []).flatMap((section: Section) => section.lessons ?? [])),
      ] as Lesson[];

      setAllLessons(flatLessons);
    } catch {
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (blockType === 'QUIZ' && blockQuizBuilder.questions.length === 0) {
      setBlockQuizBuilder(emptyQuizDraft());
    }
  }, [blockType, blockQuizBuilder.questions.length]);

  const sectionedView = useMemo(() => {
    if (!course) return [];
    return (course.sections ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        ...section,
        lessons: allLessons
          .filter((lesson) => lesson.sectionId === section.id)
          .slice()
          .sort((a, b) => a.order - b.order),
      }));
  }, [course, allLessons]);

  const unsectionedLessons = useMemo(
    () => allLessons.filter((lesson) => !lesson.sectionId).slice().sort((a, b) => a.order - b.order),
    [allLessons]
  );

  function resetBlockForm() {
    setBlockLessonId('');
    setBlockType('TEXT');
    setBlockText('');
    setBlockVideoUrl('');
    setBlockCodeLang('javascript');
    setBlockQuizData('');
    setBlockQuizMode('builder');
    setBlockQuizBuilder(emptyQuizDraft());
  }

  function openAddBlockDialog(lessonId: string) {
    setBlockLessonId(lessonId);
    setBlockDialog(true);
  }

  function openEditBlock(block: ContentBlock) {
    setEditBlock(block);
    setEditBlockText(block.textContent ?? '');
    setEditBlockVideoUrl(block.videoUrl ?? '');
    setEditBlockCodeLang(block.codeLanguage ?? 'javascript');

    const quizString = block.quizData ? JSON.stringify(block.quizData, null, 2) : '';
    setEditBlockQuizData(quizString);
    setEditQuizBuilder(normalizeQuizData(block.quizData));
    setEditQuizMode('builder');
  }

  function toggleLesson(id: string) {
    setExpandedLessons((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function uploadMediaFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorPayload.error ?? 'Upload failed');
    }

    const payload = await response.json();
    if (!payload?.url || typeof payload.url !== 'string') {
      throw new Error('Upload response did not include URL');
    }

    return payload.url;
  }

  async function handleBlockVideoFile(file: File) {
    setUploadingBlockVideo(true);
    try {
      const url = await uploadMediaFile(file);
      setBlockVideoUrl(url);
      toast.success('Video uploaded');
    } catch (error: any) {
      toast.error(error.message ?? 'Video upload failed');
    } finally {
      setUploadingBlockVideo(false);
    }
  }

  async function handleEditVideoFile(file: File) {
    setUploadingEditVideo(true);
    try {
      const url = await uploadMediaFile(file);
      setEditBlockVideoUrl(url);
      toast.success('Video uploaded');
    } catch (error: any) {
      toast.error(error.message ?? 'Video upload failed');
    } finally {
      setUploadingEditVideo(false);
    }
  }

  async function handleCreateSection(event: React.FormEvent) {
    event.preventDefault();
    if (!sectionTitle.trim()) return;

    setCreatingSection(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sectionTitle.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to create section' }));
        throw new Error(payload.error ?? 'Failed to create section');
      }

      toast.success('Section created');
      setSectionDialog(false);
      setSectionTitle('');
      fetchCourse();
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to create section');
    } finally {
      setCreatingSection(false);
    }
  }

  async function handleCreateLesson(event: React.FormEvent) {
    event.preventDefault();
    if (!lessonTitle.trim()) return;

    setCreatingLesson(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          sectionId: lessonSectionId === 'none' ? undefined : lessonSectionId,
          duration: lessonDuration ? Number(lessonDuration) : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to create lesson' }));
        throw new Error(payload.error ?? 'Failed to create lesson');
      }

      toast.success('Lesson created');
      setLessonDialog(false);
      setLessonTitle('');
      setLessonSectionId('none');
      setLessonDuration('');
      fetchCourse();
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to create lesson');
    } finally {
      setCreatingLesson(false);
    }
  }

  async function handleCreateBlock(event: React.FormEvent) {
    event.preventDefault();
    if (!blockLessonId) {
      toast.error('Lesson missing for content block');
      return;
    }

    setCreatingBlock(true);

    try {
      const payload: Record<string, unknown> = {
        lessonId: blockLessonId,
        type: blockType,
      };

      if (blockType === 'TEXT') {
        payload.textContent = blockText;
      }

      if (blockType === 'CODE') {
        payload.textContent = blockText;
        payload.codeLanguage = blockCodeLang;
      }

      if (blockType === 'VIDEO' || blockType === 'YOUTUBE') {
        if (!blockVideoUrl.trim()) {
          toast.error('Please provide a URL before saving this block');
          setCreatingBlock(false);
          return;
        }
        payload.videoUrl = blockVideoUrl.trim();
      }

      if (blockType === 'QUIZ') {
        if (blockQuizMode === 'json') {
          try {
            payload.quizData = JSON.parse(blockQuizData);
          } catch {
            toast.error('Quiz JSON is invalid');
            setCreatingBlock(false);
            return;
          }
        } else {
          const quizPayload = buildQuizPayload(blockQuizBuilder);
          if (quizPayload.questions.length === 0) {
            toast.error('Add at least one quiz question');
            setCreatingBlock(false);
            return;
          }
          payload.quizData = quizPayload;
          setBlockQuizData(JSON.stringify(quizPayload, null, 2));
        }
      }

      const response = await fetch(`/api/admin/courses/${courseId}/content-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: 'Failed to create content block' }));
        throw new Error(errorPayload.error ?? 'Failed to create content block');
      }

      toast.success('Content block created');
      setBlockDialog(false);
      resetBlockForm();
      fetchCourse();
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to create content block');
    } finally {
      setCreatingBlock(false);
    }
  }

  async function handleEditBlock(event: React.FormEvent) {
    event.preventDefault();
    if (!editBlock) return;

    setSavingBlock(true);
    try {
      const payload: Record<string, unknown> = { blockId: editBlock.id };

      if (editBlock.type === 'TEXT') {
        payload.textContent = editBlockText;
      }

      if (editBlock.type === 'CODE') {
        payload.textContent = editBlockText;
        payload.codeLanguage = editBlockCodeLang;
      }

      if (editBlock.type === 'VIDEO' || editBlock.type === 'YOUTUBE') {
        payload.videoUrl = editBlockVideoUrl;
      }

      if (editBlock.type === 'QUIZ') {
        if (editQuizMode === 'json') {
          try {
            payload.quizData = JSON.parse(editBlockQuizData);
          } catch {
            toast.error('Quiz JSON is invalid');
            setSavingBlock(false);
            return;
          }
        } else {
          const quizPayload = buildQuizPayload(editQuizBuilder);
          if (quizPayload.questions.length === 0) {
            toast.error('Add at least one quiz question');
            setSavingBlock(false);
            return;
          }
          payload.quizData = quizPayload;
          setEditBlockQuizData(JSON.stringify(quizPayload, null, 2));
        }
      }

      const response = await fetch(`/api/admin/courses/${courseId}/content-blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: 'Failed to update block' }));
        throw new Error(errorPayload.error ?? 'Failed to update block');
      }

      toast.success('Content block updated');
      setEditBlock(null);
      fetchCourse();
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to update block');
    } finally {
      setSavingBlock(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const endpoint = {
        section: `/api/admin/courses/${courseId}/sections?id=${deleteTarget.id}`,
        lesson: `/api/admin/courses/${courseId}/lessons?id=${deleteTarget.id}`,
        block: `/api/admin/courses/${courseId}/content-blocks?id=${deleteTarget.id}`,
      }[deleteTarget.type];

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(payload.error ?? 'Delete failed');
      }

      toast.success('Deleted successfully');
      setDeleteTarget(null);
      fetchCourse();
    } catch (error: any) {
      toast.error(error.message ?? 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  async function handleReorderLessons(sectionId: string | null, reordered: Lesson[]) {
    const groupKey = sectionId ?? 'standalone';
    setReorderingKey(groupKey);

    const withNewOrder = reordered.map((lesson, index) => ({
      ...lesson,
      order: index,
      sectionId,
    }));

    setAllLessons((previous) => {
      const updateMap = new Map(withNewOrder.map((lesson) => [lesson.id, lesson]));
      return previous.map((lesson) => updateMap.get(lesson.id) ?? lesson);
    });

    try {
      await Promise.all(withNewOrder.map(async (lesson) => {
        const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson.id,
            order: lesson.order,
            sectionId: lesson.sectionId,
          }),
        });

        if (!response.ok) throw new Error();
      }));

      toast.success('Lesson order updated');
      fetchCourse();
    } catch {
      toast.error('Failed to update lesson order');
      fetchCourse();
    } finally {
      setReorderingKey(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Course not found
      </div>
    );
  }

  const statusMeta = statusConfig[course.status] ?? statusConfig.DRAFT;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10 mb-4"
          >
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                <Badge variant="outline" className={statusMeta.className}>{statusMeta.label}</Badge>
                <Badge variant="outline" className="text-slate-400 border-white/10 capitalize">
                  {course.level.toLowerCase()}
                </Badge>
              </div>
              {course.description && (
                <CardDescription className="text-slate-400 max-w-2xl">{course.description}</CardDescription>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          <Button
            onClick={() => setSectionDialog(true)}
            variant="outline"
            className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
          >
            <Layers className="h-4 w-4 mr-2" />
            Add Section
          </Button>
          <Button
            onClick={() => {
              setLessonSectionId('none');
              setLessonDialog(true);
            }}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </div>

        <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
              <DialogDescription className="text-slate-400">
                Group related lessons into a section.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Section title</Label>
                <Input
                  value={sectionTitle}
                  onChange={(event) => setSectionTitle(event.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g. Smart Contract Fundamentals"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSectionDialog(false)}
                  className="border-white/10 text-slate-300 bg-white/5"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingSection} className="bg-emerald-600 hover:bg-emerald-500">
                  {creatingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Section'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add Lesson</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create the lesson shell, then add content blocks.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Lesson title</Label>
                <Input
                  value={lessonTitle}
                  onChange={(event) => setLessonTitle(event.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Section</Label>
                <Select value={lessonSectionId} onValueChange={setLessonSectionId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    <SelectItem value="none">Standalone lesson</SelectItem>
                    {sectionedView.map((section) => (
                      <SelectItem key={section.id} value={section.id}>{section.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Duration (minutes)</Label>
                <Input
                  value={lessonDuration}
                  onChange={(event) => setLessonDuration(event.target.value.replace(/\D/g, ''))}
                  className="bg-white/5 border-white/10 text-white w-32"
                  type="number"
                  min={1}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLessonDialog(false)}
                  className="border-white/10 text-slate-300 bg-white/5"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingLesson} className="bg-cyan-600 hover:bg-cyan-500">
                  {creatingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Lesson'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={blockDialog}
          onOpenChange={(open) => {
            setBlockDialog(open);
            if (!open) resetBlockForm();
          }}
        >
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Content Block</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add text, code, video, YouTube, or quiz content to this lesson.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Block type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(blockTypeConfig).map(([type, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBlockType(type)}
                        className={`p-3 rounded-lg border transition-colors ${
                          blockType === type
                            ? 'border-cyan-400/50 bg-cyan-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`h-4 w-4 mx-auto mb-1 ${meta.color}`} />
                        <span className="text-[11px] text-slate-200">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {blockType === 'TEXT' && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Markdown content</Label>
                  <Textarea
                    value={blockText}
                    onChange={(event) => setBlockText(event.target.value)}
                    rows={10}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                </div>
              )}

              {blockType === 'CODE' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Language</Label>
                    <Select value={blockCodeLang} onValueChange={setBlockCodeLang}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        {['javascript', 'typescript', 'solidity', 'python', 'rust', 'go', 'html', 'css', 'json', 'bash', 'sql'].map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Code snippet</Label>
                    <Textarea
                      value={blockText}
                      onChange={(event) => setBlockText(event.target.value)}
                      rows={10}
                      className="bg-white/5 border-white/10 text-white font-mono text-sm"
                    />
                  </div>
                </>
              )}

              {blockType === 'VIDEO' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Video URL</Label>
                    <Input
                      value={blockVideoUrl}
                      onChange={(event) => setBlockVideoUrl(event.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Upload media file</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={addVideoInputRef}
                        type="file"
                        accept="video/*,audio/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleBlockVideoFile(file);
                          event.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10 text-slate-300 bg-white/5"
                        onClick={() => addVideoInputRef.current?.click()}
                        disabled={uploadingBlockVideo}
                      >
                        {uploadingBlockVideo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload to IPFS
                      </Button>
                      {blockVideoUrl && (
                        <span className="text-xs text-slate-400 truncate">URL ready</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {blockType === 'YOUTUBE' && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">YouTube URL or embed URL</Label>
                  <Input
                    value={blockVideoUrl}
                    onChange={(event) => setBlockVideoUrl(event.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              {blockType === 'QUIZ' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={blockQuizMode === 'builder' ? 'default' : 'outline'}
                      className={blockQuizMode === 'builder' ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-white/10 text-slate-300 bg-white/5'}
                      onClick={() => setBlockQuizMode('builder')}
                    >
                      Quiz Builder
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={blockQuizMode === 'json' ? 'default' : 'outline'}
                      className={blockQuizMode === 'json' ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-white/10 text-slate-300 bg-white/5'}
                      onClick={() => {
                        setBlockQuizMode('json');
                        setBlockQuizData(JSON.stringify(buildQuizPayload(blockQuizBuilder), null, 2));
                      }}
                    >
                      JSON
                    </Button>
                  </div>

                  {blockQuizMode === 'builder' ? (
                    <QuizBuilderEditor value={blockQuizBuilder} onChange={setBlockQuizBuilder} />
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Quiz JSON</Label>
                      <Textarea
                        value={blockQuizData}
                        onChange={(event) => setBlockQuizData(event.target.value)}
                        rows={14}
                        className="bg-white/5 border-white/10 text-white font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-slate-300 bg-white/5"
                  onClick={() => {
                    setBlockDialog(false);
                    resetBlockForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingBlock} className="bg-emerald-600 hover:bg-emerald-500">
                  {creatingBlock ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Block'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editBlock} onOpenChange={(open) => { if (!open) setEditBlock(null); }}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit {editBlock ? blockTypeConfig[editBlock.type]?.label : 'Block'}
              </DialogTitle>
            </DialogHeader>

            {editBlock && (
              <form onSubmit={handleEditBlock} className="space-y-4">
                {editBlock.type === 'TEXT' && (
                  <Textarea
                    value={editBlockText}
                    onChange={(event) => setEditBlockText(event.target.value)}
                    rows={12}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  />
                )}

                {editBlock.type === 'CODE' && (
                  <>
                    <Select value={editBlockCodeLang} onValueChange={setEditBlockCodeLang}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        {['javascript', 'typescript', 'solidity', 'python', 'rust', 'go', 'html', 'css', 'json', 'bash', 'sql'].map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={editBlockText}
                      onChange={(event) => setEditBlockText(event.target.value)}
                      rows={12}
                      className="bg-white/5 border-white/10 text-white font-mono text-sm"
                    />
                  </>
                )}

                {editBlock.type === 'VIDEO' && (
                  <div className="space-y-3">
                    <Input
                      value={editBlockVideoUrl}
                      onChange={(event) => setEditBlockVideoUrl(event.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="https://..."
                    />

                    <div className="flex items-center gap-2">
                      <input
                        ref={editVideoInputRef}
                        type="file"
                        accept="video/*,audio/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleEditVideoFile(file);
                          event.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10 text-slate-300 bg-white/5"
                        onClick={() => editVideoInputRef.current?.click()}
                        disabled={uploadingEditVideo}
                      >
                        {uploadingEditVideo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload new file
                      </Button>
                    </div>
                  </div>
                )}

                {editBlock.type === 'YOUTUBE' && (
                  <Input
                    value={editBlockVideoUrl}
                    onChange={(event) => setEditBlockVideoUrl(event.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                )}

                {editBlock.type === 'QUIZ' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={editQuizMode === 'builder' ? 'default' : 'outline'}
                        className={editQuizMode === 'builder' ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-white/10 text-slate-300 bg-white/5'}
                        onClick={() => setEditQuizMode('builder')}
                      >
                        Quiz Builder
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={editQuizMode === 'json' ? 'default' : 'outline'}
                        className={editQuizMode === 'json' ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-white/10 text-slate-300 bg-white/5'}
                        onClick={() => {
                          setEditQuizMode('json');
                          setEditBlockQuizData(JSON.stringify(buildQuizPayload(editQuizBuilder), null, 2));
                        }}
                      >
                        JSON
                      </Button>
                    </div>

                    {editQuizMode === 'builder' ? (
                      <QuizBuilderEditor value={editQuizBuilder} onChange={setEditQuizBuilder} />
                    ) : (
                      <Textarea
                        value={editBlockQuizData}
                        onChange={(event) => setEditBlockQuizData(event.target.value)}
                        rows={14}
                        className="bg-white/5 border-white/10 text-white font-mono text-xs"
                      />
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 text-slate-300 bg-white/5"
                    onClick={() => setEditBlock(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingBlock} className="bg-blue-600 hover:bg-blue-500">
                    {savingBlock ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will permanently delete "{deleteTarget?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="space-y-6">
          {sectionedView.map((section) => (
            <Card key={section.id} className="bg-slate-900/40 border border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-cyan-400" />
                    <CardTitle className="text-lg text-white">{section.title}</CardTitle>
                    <Badge variant="outline" className="text-slate-400 border-white/10 text-xs">
                      {section.lessons.length} lessons
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeleteTarget({ type: 'section', id: section.id, name: section.title })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <SortableLessonList
                  lessons={section.lessons}
                  sectionId={section.id}
                  expandedLessons={expandedLessons}
                  reordering={reorderingKey === section.id}
                  onToggleLesson={toggleLesson}
                  onReorder={handleReorderLessons}
                  onAddBlock={openAddBlockDialog}
                  onEditBlock={openEditBlock}
                  onDelete={(type, id, name) => setDeleteTarget({ type, id, name })}
                />

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => {
                    setLessonSectionId(section.id);
                    setLessonDialog(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Lesson To Section
                </Button>
              </CardContent>
            </Card>
          ))}

          {unsectionedLessons.length > 0 && (
            <Card className="bg-slate-900/40 border border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-lg text-white">Standalone Lessons</CardTitle>
                  <Badge variant="outline" className="text-slate-400 border-white/10 text-xs">
                    {unsectionedLessons.length} lessons
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <SortableLessonList
                  lessons={unsectionedLessons}
                  sectionId={null}
                  expandedLessons={expandedLessons}
                  reordering={reorderingKey === 'standalone'}
                  onToggleLesson={toggleLesson}
                  onReorder={handleReorderLessons}
                  onAddBlock={openAddBlockDialog}
                  onEditBlock={openEditBlock}
                  onDelete={(type, id, name) => setDeleteTarget({ type, id, name })}
                />
              </CardContent>
            </Card>
          )}

          {sectionedView.length === 0 && unsectionedLessons.length === 0 && (
            <Card className="bg-slate-900/40 border border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
                <BookOpen className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-white font-medium mb-2">No lessons yet</p>
                <p className="text-sm mb-6">Create sections and lessons, then add block content.</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSectionDialog(true)}
                    variant="outline"
                    className="border-white/10 text-slate-300 bg-white/5"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                  <Button
                    onClick={() => {
                      setLessonSectionId('none');
                      setLessonDialog(true);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableLessonList({
  lessons,
  sectionId,
  expandedLessons,
  reordering,
  onToggleLesson,
  onReorder,
  onAddBlock,
  onEditBlock,
  onDelete,
}: {
  lessons: Lesson[];
  sectionId: string | null;
  expandedLessons: Set<string>;
  reordering: boolean;
  onToggleLesson: (id: string) => void;
  onReorder: (sectionId: string | null, lessons: Lesson[]) => Promise<void>;
  onAddBlock: (lessonId: string) => void;
  onEditBlock: (block: ContentBlock) => void;
  onDelete: (type: 'lesson' | 'block', id: string, name: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(lessons, oldIndex, newIndex);
    onReorder(sectionId, next);
  }

  if (lessons.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-4">No lessons yet.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={lessons.map((lesson) => lesson.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <SortableLessonCard
              key={lesson.id}
              lesson={lesson}
              expanded={expandedLessons.has(lesson.id)}
              reordering={reordering}
              onToggle={() => onToggleLesson(lesson.id)}
              onAddBlock={() => onAddBlock(lesson.id)}
              onEditBlock={onEditBlock}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableLessonCard({
  lesson,
  expanded,
  reordering,
  onToggle,
  onAddBlock,
  onEditBlock,
  onDelete,
}: {
  lesson: Lesson;
  expanded: boolean;
  reordering: boolean;
  onToggle: () => void;
  onAddBlock: () => void;
  onEditBlock: (block: ContentBlock) => void;
  onDelete: (type: 'lesson' | 'block', id: string, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-70' : ''}
    >
      <LessonCard
        lesson={lesson}
        expanded={expanded}
        reordering={reordering}
        dragHandleProps={{ ...attributes, ...listeners }}
        onToggle={onToggle}
        onAddBlock={onAddBlock}
        onEditBlock={onEditBlock}
        onDelete={onDelete}
      />
    </div>
  );
}

function LessonCard({
  lesson,
  expanded,
  reordering,
  dragHandleProps,
  onToggle,
  onAddBlock,
  onEditBlock,
  onDelete,
}: {
  lesson: Lesson;
  expanded: boolean;
  reordering: boolean;
  dragHandleProps: Record<string, unknown>;
  onToggle: () => void;
  onAddBlock: () => void;
  onEditBlock: (block: ContentBlock) => void;
  onDelete: (type: 'lesson' | 'block', id: string, name: string) => void;
}) {
  const sortedBlocks = (lesson.contentBlocks ?? []).slice().sort((a, b) => a.order - b.order);

  return (
    <Card className="bg-white/5 border border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <button
              type="button"
              className="mt-1 p-1 rounded hover:bg-white/10 text-slate-500"
              title="Drag to reorder lesson"
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <button type="button" onClick={onToggle} className="text-left min-w-0">
              <div className="flex items-center gap-2">
                {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                <p className="font-medium text-sm text-white truncate">{lesson.title}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-6 text-xs text-slate-500">
                {lesson.duration ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration} min
                  </span>
                ) : null}
                <span>{sortedBlocks.length} blocks</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-cyan-400 hover:bg-cyan-500/10"
              onClick={onAddBlock}
            >
              <Plus className="h-3 w-3 mr-1" />
              Block
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-400 hover:bg-red-500/10"
              onClick={() => onDelete('lesson', lesson.id, lesson.title)}
              disabled={reordering}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-3 border-t border-white/5 space-y-2">
          {sortedBlocks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No content blocks yet.</p>
          ) : (
            sortedBlocks.map((block) => {
              const typeMeta = blockTypeConfig[block.type];
              const Icon = typeMeta?.icon ?? FileText;

              return (
                <div key={block.id} className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <Icon className={`h-4 w-4 mt-0.5 ${typeMeta?.color ?? 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200">{typeMeta?.label ?? block.type}</p>
                        <p className="text-slate-500 mt-1 line-clamp-2">
                          {block.type === 'TEXT' && (block.textContent ?? 'Empty text block')}
                          {block.type === 'CODE' && `${block.codeLanguage ?? 'code'}: ${block.textContent ?? 'Empty code block'}`}
                          {(block.type === 'VIDEO' || block.type === 'YOUTUBE') && (block.videoUrl ?? 'No URL')}
                          {block.type === 'QUIZ' && `${((block.quizData as { questions?: unknown[] })?.questions ?? []).length} questions`}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => onEditBlock(block)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-red-400 hover:bg-red-500/10"
                        onClick={() => onDelete('block', block.id, `${typeMeta?.label ?? block.type} block`)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      )}
    </Card>
  );
}

function QuizBuilderEditor({
  value,
  onChange,
}: {
  value: QuizDraft;
  onChange: (next: QuizDraft) => void;
}) {
  function setQuestionValue(questionId: string, updater: (current: QuizQuestionDraft) => QuizQuestionDraft) {
    onChange({
      ...value,
      questions: value.questions.map((question) => (
        question.id === questionId ? updater(question) : question
      )),
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Passing score (%)</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={value.passingScore}
          onChange={(event) => {
            const parsed = Number(event.target.value || 0);
            onChange({
              ...value,
              passingScore: Number.isFinite(parsed) ? Math.max(1, Math.min(100, parsed)) : 70,
            });
          }}
          className="bg-white/5 border-white/10 text-white w-32"
        />
      </div>

      <div className="space-y-3">
        {value.questions.map((question, index) => (
          <Card key={question.id} className="bg-white/5 border border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white">Question {index + 1}</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (value.questions.length <= 1) return;
                    onChange({
                      ...value,
                      questions: value.questions.filter((item) => item.id !== question.id),
                    });
                  }}
                  disabled={value.questions.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Prompt</Label>
                <Textarea
                  value={question.question}
                  onChange={(event) => setQuestionValue(question.id, (current) => ({ ...current, question: event.target.value }))}
                  rows={2}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                {question.options.map((option, optionIndex) => (
                  <div className="space-y-1" key={`${question.id}-opt-${optionIndex}`}>
                    <Label className="text-slate-400 text-xs">Option {optionIndex + 1}</Label>
                    <Input
                      value={option}
                      onChange={(event) => {
                        setQuestionValue(question.id, (current) => {
                          const nextOptions = [...current.options] as [string, string, string, string];
                          nextOptions[optionIndex] = event.target.value;
                          return { ...current, options: nextOptions };
                        });
                      }}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Correct option</Label>
                <Select
                  value={String(question.correct)}
                  onValueChange={(selected) => {
                    const parsed = Number(selected);
                    setQuestionValue(question.id, (current) => ({
                      ...current,
                      correct: Number.isFinite(parsed) ? parsed : 0,
                    }));
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    <SelectItem value="0">Option 1</SelectItem>
                    <SelectItem value="1">Option 2</SelectItem>
                    <SelectItem value="2">Option 3</SelectItem>
                    <SelectItem value="3">Option 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Explanation</Label>
                <Textarea
                  value={question.explanation}
                  onChange={(event) => setQuestionValue(question.id, (current) => ({ ...current, explanation: event.target.value }))}
                  rows={2}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="border-dashed border-white/10 text-cyan-300 bg-white/5 hover:bg-white/10 w-full"
        onClick={() => onChange({ ...value, questions: [...value.questions, emptyQuestion()] })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}
