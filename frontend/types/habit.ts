/**
 * @file Habit Tracker types
 */

export type HabitPeriodType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Habit {
  id: string;
  user_username: string;
  name: string;
  description?: string;
  period_type: HabitPeriodType;
  period_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_username: string;
  completion_date: string;
  created_at?: string;
}

export interface HabitWithStats extends Habit {
  total_completions: number;
  total_periods: number;
  completion_percentage: number;
  current_streak: number;
  is_completed_today: boolean;
}

export interface HabitCreateInput {
  name: string;
  description?: string;
  period_type: HabitPeriodType;
  period_days?: number;
}

export interface HabitUpdateInput {
  name?: string;
  description?: string;
  period_type?: HabitPeriodType;
  period_days?: number;
}

export interface HabitCompletionCreateInput {
  habit_id: string;
  completion_date: string;
}
