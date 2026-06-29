import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { useAssignmentsStore } from '../store/AssignmentsStore';
import { formatFullDate, formatTime } from '../utils/helpers';
import { CoinBadge } from '../components';
import { useNavigation } from '@react-navigation/native';

export const CompletedAssignmentsScreen: React.FC = () => {
  const navigation = useNavigation() as any;
  const { assignments, loadAssignments, deleteAssignment } = useAssignmentsStore();

  useEffect(() => {
    loadAssignments();a
  }, []);

  const completedAssignments = assignments.filter((a) => a.status === 'completed');

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Assignment', `Remove "${title}" from completed?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAssignment(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Completed Assignments</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {completedAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No completed assignments yet</Text>
            <Text style={styles.emptyText}>
              Complete assignments and they'll show up here
            </Text>
          </View>
        ) : (
          completedAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{assignment.title}</Text>
                <CoinBadge amount={assignment.coinReward} size="small" />
              </View>
              <Text style={styles.cardMeta}>
                Completed {assignment.completedAt ? formatFullDate(assignment.completedAt) : ''}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(assignment.id, assignment.title)}
              >
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.error + '15',
  },
  deleteText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
});
