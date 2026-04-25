export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  vision3Year?: string;
  targetIncome?: string;
  dreamCareer?: string;
  fitnessGoal?: string;
  completedAssessment?: boolean;
  streaks?: { [key: string]: number };
  createdAt: string;
}

export type GoalCategory = "Money & Wealth" | "Fitness & Energy" | "Mindset & Focus" | "Learning & Skills" | "Network & Relationships" | "Discipline & Habits";

export interface Goal {
  id: string;
  userId: string;
  category: GoalCategory;
  title: string;
  description: string;
  targetDate?: string;
  status: "pending" | "in-progress" | "completed";
  progress: number;
  photoUrl?: string;
  createdAt: string;
}

export interface RoutineItem {
  id: string;
  userId: string;
  title: string;
  time: string;
  trigger?: string;
  completedTodayIndex?: string; // date string
  order: number;
}

export interface DailyLog {
  userId: string;
  date: string;
  sleepHours: number;
  affirmationDone: boolean;
  meditationMinutes: number;
  meals: string[];
  learning: string;
  photoUrl?: string;
  aiFeedback?: string;
  feedbackRating?: number;
  winOfDay?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface AssessmentResponse {
  userId: string;
  answers: { [questionId: string]: any };
  rawScore: number;
  timestamp: string;
}

export interface PeriodicReport {
  summary: string;
  strengths: string[];
  improvements: string[];
  score: number;
}
