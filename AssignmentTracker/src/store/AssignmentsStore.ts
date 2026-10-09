import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Assignment, AssignmentType } from '../types';

interface AssignmentsState {
  assignments: Assignment[];
  loadAssignments: () => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'status' | 'coinReward' | 'createdAt' | 'completedAt'>) => Promise<void>;
  updateAssignment: (assignment: Assignment) => Promise<void>;
  completeAssignment: (id: string) => Promise<void>;
  restoreAssignment: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

interface AssignmentsStore extends AssignmentsState {
  assignments: Assignment[];
}

const STORAGE_KEY = '@assignments';

// Auto-prune completed assignments: keep only the most recent COMPLETED_LIMIT.
// Gated off by default (like SHOW_REWARDS) so the behavior is opt-in.
const AUTO_PRUNE_COMPLETED = false;
const COMPLETED_LIMIT = 25;

const generateId = (): string => Math.random().toString(36).substring(2, 15);

const completedTime = (assignment: Assignment): number => {
  const time = (assignment.completedAt ?? assignment.createdAt).getTime();
  return isNaN(time) ? 0 : time;
};

// Drop the oldest completed assignments beyond COMPLETED_LIMIT. Pending items are untouched.
export const pruneCompletedAssignments = (
  assignments: Assignment[]
): { assignments: Assignment[]; removed: number } => {
  const completed = assignments.filter((a) => a.status === 'completed');
  if (completed.length <= COMPLETED_LIMIT) {
    return { assignments, removed: 0 };
  }

  const keepIds = new Set(
    [...completed]
      .sort((a, b) => completedTime(b) - completedTime(a))
      .slice(0, COMPLETED_LIMIT)
      .map((a) => a.id)
  );
  const next = assignments.filter((a) => a.status !== 'completed' || keepIds.has(a.id));
  return { assignments: next, removed: assignments.length - next.length };
};

// Convert raw storage data to valid assignments; returns null for malformed items.
const hydrateAssignment = (raw: any): Assignment | null => {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || typeof raw.title !== 'string') {
    return null;
  }
  const deadline = new Date(raw.deadline);
  const createdAt = new Date(raw.createdAt);
  if (isNaN(deadline.getTime()) || isNaN(createdAt.getTime())) {
    return null;
  }
  const completedAt = raw.completedAt ? new Date(raw.completedAt) : undefined;
  const validCompletedAt = completedAt && !isNaN(completedAt.getTime()) ? completedAt : undefined;
  return { ...raw, deadline, createdAt, completedAt: validCompletedAt };
};

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
        if (!Array.isArray(parsed)) {
          set({ assignments: [] });
          return;
        }
        let assignments = parsed
          .map(hydrateAssignment)
          .filter((a): a is Assignment => a !== null);

        // Only prune when the feature flag is enabled; persist if anything was removed.
        if (AUTO_PRUNE_COMPLETED) {
          const pruned = pruneCompletedAssignments(assignments);
          if (pruned.removed > 0) {
            assignments = pruned.assignments;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
          }
        }

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
      customType: assignment.customType,
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

  updateAssignment: async (assignment) => {
    // Recalculate coinReward based on type and duration
    const updatedWithReward: Assignment = {
      ...assignment,
      coinReward: calculateCoinReward(assignment.type, assignment.duration),
    };
    const updated = get().assignments.map((a) => (a.id === assignment.id ? updatedWithReward : a));
    set({ assignments: updated });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update assignment:', error);
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

  // Undo: move a completed assignment back to pending and clear completedAt.
  restoreAssignment: async (id: string) => {
    const assignments = get().assignments.map((a: Assignment) =>
      a.id === id && a.status === 'completed'
        ? { ...a, status: 'pending' as const, completedAt: undefined }
        : a
    );
    set({ assignments });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to restore assignment:', error);
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
