import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Assignment, AssignmentType } from '../types';
import { mockUser, mockAssignments } from '../data/mockData';
import { AssignmentCard, UserCard, FloatingButton } from '../components';
import { colors } from '../utils/colors';
import { formatFullDate, getDayName, isSameDay } from '../utils/helpers';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [assignments] = useState<Assignment[]>(mockAssignments);
  const [user] = useState(mockUser);
  // Removed modal -> navigation-based Add screen
  const groupedAssignments = assignments.reduce((groups, assignment) => {
    const dateKey = assignment.deadline.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(assignment);
    return groups;
  }, {} as Record<string, Assignment[]>);

  const sortedDates = Object.keys(groupedAssignments).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const handleAddAssignment = () => {
    // Try navigating to root navigator to access AddAssignment screen
    const navAny: any = navigation;
    const root = navAny.getParent?.();
    if (root && typeof root.navigate === 'function') {
      root.navigate('AddAssignment');
    } else {
      navigation.navigate('AddAssignment' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>Assignment Tracker</Text>
          <Text style={styles.date}>{formatFullDate(new Date())}</Text>
        </View>

        <View style={styles.section}>
          <UserCard name={user.name} coinBalance={user.coinBalance} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
          {sortedDates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>No assignments yet</Text>
              <Text style={styles.emptyText}>
                Tap the + button to add your first assignment
              </Text>
            </View>
          ) : (
            sortedDates.map((dateKey) => {
              const date = new Date(dateKey);
              const dayAssignments = groupedAssignments[dateKey];
              return (
                <View key={dateKey} style={styles.dayGroup}>
                  <Text style={styles.dayHeader}>{getDayName(date)}</Text>
                  {dayAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onPress={() => {}}
                    />
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
  onPress={handleAddAssignment}
  style={{ position: 'absolute', bottom: 170, right: 30, backgroundColor: 'blue', padding: 20 }}
>
  <Text style={{ color: 'white' }}>ADD</Text>
</TouchableOpacity>

      {/* Add Assignment screen is a separate route; the FAB navigates there */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  dayGroup: {
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 4,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  datePicker: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.textLight,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});
