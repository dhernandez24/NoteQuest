export type AssignmentType = 'homework' | 'test' | 'task' | 'other';

// Single source of truth for valid assignment types (used by forms and settings validation).
export const ASSIGNMENT_TYPES = ['homework', 'test', 'task', 'other'] as const;

export interface AppSettings {
  defaultAssignmentType: AssignmentType;
}

export interface Assignment {
  id: string;
  title: string;
  type: AssignmentType;
   customType?: string;
  duration: number;
  deadline: Date;
  description: string;
  status: 'pending' | 'completed';
  coinReward: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface User {
  name: string;
  coinBalance: number;
  unlockedItems: string[];
}
