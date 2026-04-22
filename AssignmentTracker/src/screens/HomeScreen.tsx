import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Assignment } from '../types';
import { mockUser } from '../data/mockData';
import { AssignmentCard, UserCard, FloatingButton } from '../components';
import { colors } from '../utils/colors';
import { formatFullDate, getDayName } from '../utils/helpers';
import { useAssignmentsStore } from '../store/AssignmentsStore';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { assignments, loadAssignments, completeAssignment } = useAssignmentsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [user] = useState(mockUser);

  useEffect(() => {
    loadAssignments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  };

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
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.navigate('AddAssignment');
    } else {
      navigation.navigate('AddAssignment');
    }
  };

  const handleCompleteAssignment = async (id: string) => {
    await completeAssignment(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
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
                      onPress={() => handleCompleteAssignment(assignment.id)}
                    />
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <FloatingButton onPress={handleAddAssignment} />
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
});