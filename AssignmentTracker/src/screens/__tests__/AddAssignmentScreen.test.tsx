import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddAssignmentScreen } from '../AddAssignmentScreen';

const mockAddAssignment = jest.fn().mockResolvedValue(undefined);
const mockUpdateAssignment = jest.fn().mockResolvedValue(undefined);
const mockLoadAssignments = jest.fn().mockResolvedValue(undefined);
let mockAssignments: any[] = [];

jest.mock('../../store/AssignmentsStore', () => ({
  useAssignmentsStore: () => ({
    addAssignment: mockAddAssignment,
    updateAssignment: mockUpdateAssignment,
    loadAssignments: mockLoadAssignments,
    assignments: mockAssignments,
  }),
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({ params: {} }),
}));

describe('AddAssignmentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssignments = [];
  });

  it('renders without crashing', () => {
    const { getByText } = render(<AddAssignmentScreen />);
    expect(getByText(/adding assignment/i)).toBeTruthy();
  });

  it('has a title input field', () => {
    const { getByPlaceholderText } = render(<AddAssignmentScreen />);
    expect(getByPlaceholderText(/add title/i)).toBeTruthy();
  });

  it('has a save button', () => {
    const { getByText } = render(<AddAssignmentScreen />);
    expect(getByText(/^add$/i)).toBeTruthy();
  });

  it('calls addAssignment on valid submit', async () => {
    const { getByPlaceholderText, getByText } = render(<AddAssignmentScreen />);

    fireEvent.changeText(getByPlaceholderText(/add title/i), 'Math Homework');
    fireEvent.changeText(getByPlaceholderText(/minutes/i), '90');

    fireEvent.press(getByText(/^add$/i));

    await waitFor(() => {
      expect(mockAddAssignment).toHaveBeenCalled();
    });
  });

  it('navigates back after saving', async () => {
    const { getByPlaceholderText, getByText } = render(<AddAssignmentScreen />);

    fireEvent.changeText(getByPlaceholderText(/add title/i), 'Biology Lab');
    fireEvent.press(getByText(/^add$/i));

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('does not call addAssignment when title is empty', () => {
    const { getByText } = render(<AddAssignmentScreen />);
    fireEvent.press(getByText(/^add$/i));
    expect(mockAddAssignment).not.toHaveBeenCalled();
  });
});
