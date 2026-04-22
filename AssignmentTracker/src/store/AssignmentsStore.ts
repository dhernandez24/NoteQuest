import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Assignment, AssignmentType } from '../types';

interface AssignmentsState {
  assignments: Assignment[];
  loadAssignments: () => Promise<void>;
  addAssignment: (assignment: { title: string; type: AssignmentType; duration: number; deadline: Date; description?: string }) => Promise<void>;
  completeAssignment: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

interface AssignmentsStore extends AssignmentsState {
  assignments: Assignment[];
}

const STORAGE_KEY = '@assignments';

const generateId = (): string => Math.random().toString(36).substring(2, 15);

const calculateCoinReward = (type: AssignmentType, duration: number): number => {
  let base = 5;
  if (type === 'test') base = 10;
  if (duration >= 120) base += 2;
  if (duration >= 180) base += 3;
  return base;
};

export const useAssignmentsStore = create<AssignmentsStore>((set, get) => ({
  assignments: [],

  loadAssignments: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const assignments: Assignment[] = parsed.map((a: any) => ({
          ...a,
          deadline: new Date(a.deadline),
          createdAt: new Date(a.createdAt),
          completedAt: a.completedAt ? new Date(a.completedAt) : undefined,
        }));
        set({ assignments });
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  },

  addAssignment: async (assignment) => {
    const newAssignment: Assignment = {
      id: generateId(),
      title: assignment.title,
      type: assignment.type,
      duration: assignment.duration,
      deadline: assignment.deadline,
      description: assignment.description || '',
      status: 'pending',
      coinReward: calculateCoinReward(assignment.type, assignment.duration),
      createdAt: new Date(),
    };

    const updated = [...get().assignments, newAssignment];
    set({ assignments: updated });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  },

  completeAssignment: async (id: string) => {
    const assignments = get().assignments.map((a: Assignment) =>
      a.id === id ? { ...a, status: 'completed' as const, completedAt: new Date() } : a
    );
    set({ assignments });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to complete assignment:', error);
    }
  },

  deleteAssignment: async (id: string) => {
    const assignments = get().assignments.filter((a: Assignment) => a.id !== id);
    set({ assignments });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  },
}));
