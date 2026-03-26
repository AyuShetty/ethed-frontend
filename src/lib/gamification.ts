import { prisma } from "./prisma-client";

const XP_PER_LESSON = 10;
const XP_FOR_STREAK = 5;

// Better level thresholds for gamification (progressive XP requirements)
const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 1000 },
  { level: 3, minXp: 2500 },
  { level: 4, minXp: 5000 },
  { level: 5, minXp: 8000 },
  { level: 10, minXp: 15000 },
  { level: 20, minXp: 30000 },
];

export function calculateLevel(totalXp: number): number {
  const level = [...LEVEL_THRESHOLDS].reverse().find(t => t.minXp <= totalXp)?.level || 1;
  return level;
}

export async function addXpAndProgress(userId: string, lessonId?: string, customXp?: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, streak: true, lastLearnedAt: true },
  });

  if (!user) return null;

  let newXp = user.xp + (customXp || XP_PER_LESSON);
  let newStreak = user.streak;
  const now = new Date();
  const lastLearned = user.lastLearnedAt;

  // Streak logic
  if (lastLearned) {
    const lastDate = new Date(lastLearned);
    const diffInDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      // Consecutive day
      newStreak += 1;
      newXp += XP_FOR_STREAK;
    } else if (diffInDays > 1) {
      // Streak broken
      newStreak = 1;
    }
  } else {
    // First time learning
    newStreak = 1;
  }

  // Use improved level calculation with thresholds
  const newLevel = calculateLevel(newXp);

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastLearnedAt: now,
    },
  });

  // Log lesson progress if provided
  if (lessonId) {
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        lessonId,
        completed: true,
      },
    });
  }

  return updatedUser;
}
