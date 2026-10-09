import { useAssignmentsStore, pruneCompletedAssignments } from '../../store/AssignmentsStore';
import { Assignment } from '../../types';

const baseAssignment = {
  title: 'Math Homework',
  type: 'homework' as const,
  duration: 60,
  deadline: new Date('2026-07-15'),
  description: 'Chapter 5 problems',
};

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'id',
    title: 'Test',
    type: 'homework',
    duration: 60,
    deadline: new Date('2026-07-15'),
    description: '',
    status: 'pending',
    coinReward: 5,
    createdAt: new Date('2026-07-01'),
    ...overrides,
  };
}

describe('AssignmentsStore', () => {
  beforeEach(() => {
    useAssignmentsStore.setState({ assignments: [] });
  });

  it('stores a new assignment with generated id and defaults', async () => {
    await useAssignmentsStore.getState().addAssignment(baseAssignment);
    const { assignments } = useAssignmentsStore.getState();

    expect(assignments).toHaveLength(1);
    expect(assignments[0].title).toBe('Math Homework');
    expect(assignments[0].type).toBe('homework');
    expect(assignments[0].duration).toBe(60);
    expect(assignments[0].status).toBe('pending');
    expect(assignments[0].id).toBeDefined();
    expect(assignments[0].createdAt).toBeInstanceOf(Date);
    expect(assignments[0].completedAt).toBeUndefined();
  });

  it('marks an assignment as completed', async () => {
    await useAssignmentsStore.getState().addAssignment(baseAssignment);
    const { id } = useAssignmentsStore.getState().assignments[0];

    await useAssignmentsStore.getState().completeAssignment(id);
    const { assignments } = useAssignmentsStore.getState();

    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('completed');
  });

  it('sets completedAt when completing an assignment', async () => {
    await useAssignmentsStore.getState().addAssignment(baseAssignment);
    const { id } = useAssignmentsStore.getState().assignments[0];

    await useAssignmentsStore.getState().completeAssignment(id);
    const { assignments } = useAssignmentsStore.getState();

    expect(assignments[0].completedAt).toBeDefined();
    expect(assignments[0].completedAt).toBeInstanceOf(Date);
  });

  describe('coin reward calculation', () => {
    it('awards 5 base coins for homework', async () => {
      await useAssignmentsStore.getState().addAssignment(baseAssignment);
      expect(useAssignmentsStore.getState().assignments[0].coinReward).toBe(5);
    });

    it('awards 10 base coins for test type', async () => {
      await useAssignmentsStore.getState().addAssignment({
        ...baseAssignment,
        type: 'test',
      });
      expect(useAssignmentsStore.getState().assignments[0].coinReward).toBe(10);
    });

    it('adds +2 bonus for durations of 120+ minutes', async () => {
      await useAssignmentsStore.getState().addAssignment({
        ...baseAssignment,
        duration: 120,
      });
      expect(useAssignmentsStore.getState().assignments[0].coinReward).toBe(7);
    });

    it('adds +5 total bonus for durations of 180+ minutes (120+2 + 180+3 stack)', async () => {
      await useAssignmentsStore.getState().addAssignment({
        ...baseAssignment,
        duration: 180,
      });
      expect(useAssignmentsStore.getState().assignments[0].coinReward).toBe(10);
    });
  });

  it('recalculates coinReward when updating an assignment', async () => {
    await useAssignmentsStore.getState().addAssignment(baseAssignment);
    expect(useAssignmentsStore.getState().assignments[0].coinReward).toBe(5);

    const existing = useAssignmentsStore.getState().assignments[0];
    await useAssignmentsStore.getState().updateAssignment({
      ...existing,
      type: 'test',
      duration: 180,
    });
    const { assignments } = useAssignmentsStore.getState();
    expect(assignments[0].coinReward).toBe(15);
  });

  it('removes an assignment from state on delete', async () => {
    await useAssignmentsStore.getState().addAssignment(baseAssignment);
    expect(useAssignmentsStore.getState().assignments).toHaveLength(1);

    const { id } = useAssignmentsStore.getState().assignments[0];
    await useAssignmentsStore.getState().deleteAssignment(id);

    expect(useAssignmentsStore.getState().assignments).toHaveLength(0);
  });

  describe('restoreAssignment', () => {
    it('returns a completed assignment to pending and clears completedAt', async () => {
      await useAssignmentsStore.getState().addAssignment(baseAssignment);
      const { id } = useAssignmentsStore.getState().assignments[0];
      await useAssignmentsStore.getState().completeAssignment(id);

      await useAssignmentsStore.getState().restoreAssignment(id);
      const { assignments } = useAssignmentsStore.getState();

      expect(assignments[0].status).toBe('pending');
      expect(assignments[0].completedAt).toBeUndefined();
    });

    it('is safe to restore an assignment that is already pending', async () => {
      await useAssignmentsStore.getState().addAssignment(baseAssignment);
      const { id } = useAssignmentsStore.getState().assignments[0];

      await useAssignmentsStore.getState().restoreAssignment(id);
      const { assignments } = useAssignmentsStore.getState();

      expect(assignments[0].status).toBe('pending');
    });
  });

  describe('pruneCompletedAssignments', () => {
    it('keeps only the 25 most recent completed assignments', () => {
      const completed = Array.from({ length: 30 }, (_, i) =>
        makeAssignment({
          id: `c${i}`,
          status: 'completed',
          completedAt: new Date(2026, 0, i + 1),
        })
      );

      const { assignments, removed } = pruneCompletedAssignments(completed);
      const kept = assignments.filter((a) => a.status === 'completed');

      expect(kept).toHaveLength(25);
      expect(removed).toBe(5);
      expect(assignments.some((a) => a.id === 'c29')).toBe(true);
      expect(assignments.some((a) => a.id === 'c0')).toBe(false);
    });

    it('leaves pending assignments untouched', () => {
      const items = [
        makeAssignment({ id: 'p1' }),
        ...Array.from({ length: 30 }, (_, i) =>
          makeAssignment({
            id: `c${i}`,
            status: 'completed',
            completedAt: new Date(2026, 0, i + 1),
          })
        ),
      ];

      const { assignments } = pruneCompletedAssignments(items);

      expect(assignments.filter((a) => a.status === 'pending')).toHaveLength(1);
      expect(assignments.filter((a) => a.status === 'completed')).toHaveLength(25);
    });

    it('treats an invalid completedAt as oldest without crashing', () => {
      const items = Array.from({ length: 27 }, (_, i) =>
        makeAssignment({
          id: `c${i}`,
          status: 'completed',
          completedAt: i === 0 ? new Date('not-a-date') : new Date(2026, 0, i + 1),
        })
      );

      const { assignments, removed } = pruneCompletedAssignments(items);

      expect(removed).toBe(2);
      expect(assignments.some((a) => a.id === 'c0')).toBe(false);
    });
  });
});
