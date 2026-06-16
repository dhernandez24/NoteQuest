import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

const mockLoadAssignments = jest.fn();
const mockCompleteAssignment = jest.fn();
let mockAssignments: any[] = [];

jest.mock('../../store/AssignmentsStore', () => ({
  useAssignmentsStore: () => ({
    get assignments() {
      return mockAssignments;
    },
    loadAssignments: mockLoadAssignments,
    completeAssignment: mockCompleteAssignment,
  }),
}));

const mockNavigate = jest.fn();
const mockGetParent = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    getParent: mockGetParent,
  }),
}));

function createAssignment(overrides: Record<string, any> = {}) {
  return {
    id: '1',
    title: 'Test Assignment',
    type: 'homework' as const,
    duration: 60,
    deadline: new Date(),
    description: 'A test assignment',
    status: 'pending' as const,
    coinReward: 5,
    createdAt: new Date(),
    completedAt: undefined,
    ...overrides,
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssignments = [];
    mockGetParent.mockReturnValue(null);
  });

  it('calls loadAssignments on mount', () => {
    render(<HomeScreen />);
    expect(mockLoadAssignments).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when there are no assignments', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/no assignments yet/i)).toBeTruthy();
  });

  it('enters selection mode when Select is pressed', () => {
    mockAssignments = [createAssignment()];
    const { rerender, getByText } = render(<HomeScreen />);
    rerender(<HomeScreen />);

    fireEvent.press(getByText(/select/i));
    expect(getByText(/cancel/i)).toBeTruthy();
  });


  // check theses ones, after selecting on my end, does not show mark as complete button, but test is passing
  //completebutton is not visible, find issue
  it('marks selected assignments as complete', async () => {
    mockAssignments = [createAssignment()];
    const { rerender, getByText } = render(<HomeScreen />);
    rerender(<HomeScreen />);

    fireEvent.press(getByText(/select/i));
    fireEvent.press(getByText(/test assignment/i));

    expect(getByText(/mark as complete/i)).toBeTruthy();
    fireEvent.press(getByText(/mark as complete/i));

    await waitFor(() => {
      expect(mockCompleteAssignment).toHaveBeenCalledWith('1');
    });
    expect(mockLoadAssignments).toHaveBeenCalledTimes(2);
  });

  it('disables Mark as Complete when no assignments are selected', () => {
    mockAssignments = [createAssignment()];
    const { rerender, getByText } = render(<HomeScreen />);
    rerender(<HomeScreen />);

    fireEvent.press(getByText(/select/i));
    const markComplete = getByText(/mark as complete/i);
    expect(markComplete).toBeDisabled();
  });


});
