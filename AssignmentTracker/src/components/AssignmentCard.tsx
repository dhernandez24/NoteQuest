import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Assignment } from '../types';
import { colors } from '../utils/colors';
import { formatTime, getTypeColor, getTypeLabel, formatDuration } from '../utils/helpers';
import { CoinBadge } from './CoinBadge';

interface AssignmentCardProps {
  assignment: Assignment;
  onPress?: () => void;
  selected?: boolean;
  selectionMode?: boolean;
  onSelect?: (id: string) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onPress,
  selected = false,
  selectionMode = false,
  onSelect,
}) => {
  const typeColor = getTypeColor(assignment.type);

  const handlePress = () => {
    if (selectionMode) {
      onSelect?.(assignment.id);
    } else {
      onPress?.();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {selectionMode && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}
      <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{assignment.title}</Text>
          <CoinBadge amount={assignment.coinReward} size="small" />
        </View>
        <View style={styles.meta}>
          <View style={[styles.typeTag, { backgroundColor: typeColor + '15' }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>
  {assignment.type === 'other'
    ? assignment.customType
    : getTypeLabel(assignment.type)}
</Text>
          </View>
          <Text style={styles.duration}>{formatDuration(assignment.duration)}</Text>
        </View>
        <Text style={styles.deadline}>
          Due {formatTime(assignment.deadline)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginTop: 16,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  typeIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  duration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deadline: {
    fontSize: 13,
    color: colors.textLight,
  },
});
