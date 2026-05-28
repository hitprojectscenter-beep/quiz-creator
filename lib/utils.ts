import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// XP and Level calculation
export function calculateLevel(xp: number): number {
  // Level formula: each level requires 100 * level XP
  // Level 1: 0-100, Level 2: 100-300, Level 3: 300-600, etc.
  let level = 1;
  let required = 100;
  let total = 0;
  while (total + required <= xp) {
    total += required;
    level++;
    required = 100 * level;
  }
  return level;
}

export function xpForNextLevel(xp: number): { current: number; needed: number; total: number } {
  const level = calculateLevel(xp);
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 100 * i;
  }
  const needed = 100 * level;
  const current = xp - total;
  return { current, needed, total };
}

export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function calculateXP(score: number, total: number, difficulty: string): number {
  const percentage = (score / total) * 100;
  const difficultyMultiplier = difficulty === "hard" ? 2 : difficulty === "medium" ? 1.5 : 1;
  const baseXP = Math.round(score * 10 * difficultyMultiplier);
  const bonusXP = percentage === 100 ? 50 : percentage >= 90 ? 25 : 0;
  return baseXP + bonusXP;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
