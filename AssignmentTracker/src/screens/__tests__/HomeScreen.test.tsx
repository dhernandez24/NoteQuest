import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

const mockLoadAssignments = jest.fn();
const mockCompleteAssignment = jest.fn();
let mockAssignments: any[] = [];

jest.mock('../../store/AssignmentsStore', () => ({
  useAssignmentsStore: () => ({
    get assignments() { return mockAssignments; },
    loadAssignments: mockLoadAssignments,
    completeAssignment: mockCompleteAssignment,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    getParent: () => null,
  }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssignments = [];
  });

  it('renders without crashing', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/assignment tracker/i)).toBeTruthy();
  });

  it('shows empty state when no assignments', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/no assignments yet/i)).toBeTruthy();
  });

  it('navigates to AddAssignment when FAB is pressed', () => {
    const { getByLabelText } = render(<HomeScreen />);
    const fab = getByLabelText(/add assignment/i);
    fireEvent.press(fab);
    expect(mockNavigate).toHaveBeenCalledWith('AddAssignment');
  });

  it('renders assignments when they exist', () => {
    mockAssignments = [
      {
        id: '1',
        title: 'Test Assignment',
        type: 'homework',
        duration: 60,
        deadline: new Date(),
        description: 'Test description',
        status: 'pending',
        coinReward: 5,
        createdAt: new Date(),
      },
    ];

    const { rerender, getByText } = render(<HomeScreen />);
    rerender(<HomeScreen />);
    expect(getByText(/test assignment/i)).toBeTruthy();
  });
});
