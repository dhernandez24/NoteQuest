export type AssignmentType = 'homework' | 'test' | 'task' | 'other';

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
