export type CoachPersonality = "strategist" | "drill" | "mentor" | "stoic";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UserContext {
  name: string;
  disciplineScore: number;
  productivityScore: number;
  focusScore: number;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  longestStreak: number;
  honestyLevel: number;
  tasksCompleted: number;
  tasksTotal: number;
  focusMinutes: number;
  focusTarget: number;
  sleepHours: number;
  calories: number;
  caloriesTarget: number;
  mood: number;
  energy: number;
  goals: string[];
  patterns: string[];
}
