import { useAssignmentsStore } from '../../store/AssignmentsStore';

const baseAssignment = {
  title: 'Math Homework',
  type: 'homework' as const,
  duration: 60,
  deadline: new Date('2026-07-15'),
  description: 'Chapter 5 problems',
};

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
});
