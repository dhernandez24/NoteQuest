/**
 * Simple unit test for AddAssignmentScreen
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AddAssignmentScreen } from '../AddAssignmentScreen';

// Mock the useAssignmentsStore hook
jest.mock('../store/AssignmentsStore', () => ({
  useAssignmentsStore: () => ({
    addAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    loadAssignments: jest.fn(),
  }),
}));

// Mock useNavigation and useRoute
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

describe('AddAssignmentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AddAssignmentScreen />);
    expect(screen.getByText(/adding assignment/i)).toBeTruthy();
  });

  it('has a title input field', () => {
    render(<AddAssignmentScreen />);
    const titleInput = screen.getByPlaceholderText(/add title/i);
    expect(titleInput).toBeTruthy();
  });

  it('has a save button', () => {
    render(<AddAssignmentScreen />);
    const saveButton = screen.getByText(/add/i);
    expect(saveButton).toBeTruthy();
  });

  it('calls addAssignment when save button is pressed with valid title', async () => {
    const { addAssignment } = require('../store/AssignmentsStore');
    render(<AddAssignmentScreen />);

    const titleInput = screen.getByPlaceholderText(/add title/i);
    fireEvent.changeText(titleInput, 'Test Assignment');
    // We'll also fill out other required fields to avoid validation errors
    const durationInput = screen.getByPlaceholderText(/minutes/i);
    fireEvent.changeText(durationInput, '60');

    const saveButton = screen.getByText(/add/i);
    fireEvent.press(saveButton);

    // Wait for the async operation and navigation
    await waitFor(() => {
      expect(addAssignment).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Assignment',
        })
      );
    });
  });

  it('shows an error when title is empty and save is pressed', async () => {
    const { Alert } = require('react-native');
    Alert.alert = jest.fn();
    render(<AddAssignmentScreen />);

    const saveButton = screen.getByText(/add/i);
    fireEvent.press(saveButton);

    // Wait for the alert
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Missing Title', 'Please enter a title for your assignment.');
    });
  });
});