import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Assignment } from '../types';
import { mockUser } from '../data/mockData';
import { AssignmentCard, UserCard, FloatingButton } from '../components';
import { colors } from '../utils/colors';
import { formatFullDate, getDayName } from '../utils/helpers';
import { useAssignmentsStore } from '../store/AssignmentsStore';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation() as any;
  const { assignments, loadAssignments, completeAssignment } = useAssignmentsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [user] = useState(mockUser);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAssignments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  }, [loadAssignments]);

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');

  const groupedAssignments = pendingAssignments.reduce((groups, assignment) => {
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

  const handleEditAssignment = (id: string) => {
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.navigate('AddAssignment', { assignmentId: id });
    } else {
      navigation.navigate('AddAssignment', { assignmentId: id });
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMarkComplete = async () => {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => completeAssignment(id)));
    setSelectedIds(new Set());
    setSelectionMode(false);
    await loadAssignments();
  };

  const handleViewCompleted = () => {
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.navigate('CompletedAssignments');
    } else {
      navigation.navigate('CompletedAssignments');
    }
  };

  const hasSelected = selectedIds.size > 0;

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
        <View style={styles.addbutton}>
        {!selectionMode && <FloatingButton onPress={handleAddAssignment} />}
        </View>
          
        <View style={styles.section2}>
          <UserCard name={user.name} coinBalance={user.coinBalance} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
           
            <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.completedCta} onPress={handleViewCompleted}>
                <Text style={styles.completedCtaText}>Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedIds(new Set());
                }}
              >
                <Text style={styles.selectButtonText}>
                  {selectionMode ? 'Cancel' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
                      selected={selectedIds.has(assignment.id)}
                      selectionMode={selectionMode}
                      onSelect={handleSelect}
                      onPress={() => handleEditAssignment(assignment.id)}
                    />
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionCount}>
            {hasSelected ? `${selectedIds.size} selected` : 'Select assignments'}
          </Text>
          <TouchableOpacity
            style={[styles.completeButton, !hasSelected && styles.completeButtonDisabled]}
            onPress={handleMarkComplete}
            disabled={!hasSelected}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      
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
    paddingBottom: 140,
  },
  header: {
  backgroundColor: '#683A67',
  padding: 24,
  marginHorizontal: -20,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  marginBottom: 24,

  },

  addbutton: {
    marginBottom: 24,

  },
  appTitle: {
  color: '#FFF',
  fontFamily: 'Irish Grover',
  fontSize: 36,
  fontStyle: 'normal',
  fontWeight: '400',
  marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  section2: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completedCta: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.success + '15',
  },
  completedCtaText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.success,
  },
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
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
  selectionBar: {
    position: 'absolute',
    bottom: 10,
    left: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  completeButtonDisabled: {
    backgroundColor: colors.border,
  },
  completeButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});
