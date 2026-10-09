import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CompletedAssignmentsScreen } from '../CompletedAssignmentsScreen';

const mockLoadAssignments = jest.fn();
const mockDeleteAssignment = jest.fn();
const mockRestoreAssignment = jest.fn();
let mockAssignments: any[] = [];

jest.mock('../../store/AssignmentsStore', () => ({
  useAssignmentsStore: () => ({
    get assignments() {
      return mockAssignments;
    },
    loadAssignments: mockLoadAssignments,
    deleteAssignment: mockDeleteAssignment,
    restoreAssignment: mockRestoreAssignment,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

function createCompletedAssignment(overrides: Record<string, any> = {}) {
  return {
    id: 'done-1',
    title: 'Finished Essay',
    type: 'homework' as const,
    duration: 60,
    deadline: new Date('2026-07-15'),
    description: 'Done',
    status: 'completed' as const,
    coinReward: 5,
    createdAt: new Date('2026-07-01'),
    completedAt: new Date('2026-07-10'),
    ...overrides,
  };
}

describe('CompletedAssignmentsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssignments = [];
  });

  it('calls loadAssignments on mount', () => {
    render(<CompletedAssignmentsScreen />);
    expect(mockLoadAssignments).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when there are no completed assignments', () => {
    const { getByText } = render(<CompletedAssignmentsScreen />);
    expect(getByText(/no completed assignments yet/i)).toBeTruthy();
  });

  it('restores an assignment to pending when Undo is pressed', () => {
    mockAssignments = [createCompletedAssignment()];
    const { getByText } = render(<CompletedAssignmentsScreen />);

    fireEvent.press(getByText(/undo/i));
    expect(mockRestoreAssignment).toHaveBeenCalledWith('done-1');
  });
});
