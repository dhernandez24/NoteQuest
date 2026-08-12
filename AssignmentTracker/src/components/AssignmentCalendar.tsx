import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarProvider, CalendarUtils, ExpandableCalendar } from 'react-native-calendars';
import { Assignment } from '../types';
import { colors } from '../utils/colors';

type ViewMode = 'month' | 'week';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  selectedDate?: Date | null;
  onDayPress: (dateString: string) => void;
}

const calendarTheme = {
  calendarBackground: colors.surface,
  todayTextColor: colors.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.surface,
  dayTextColor: colors.text,
  monthTextColor: colors.text,
  arrowColor: colors.primary,
  textDisabledColor: colors.textLight,
  textSectionTitleColor: colors.textSecondary,
  dotColor: colors.primary,
  selectedDotColor: colors.surface,
  textDayFontSize: 15,
  textDayHeaderFontSize: 12,
  textMonthFontSize: 18,
  textDayFontWeight: '500',
  textDayHeaderFontWeight: '500',
  textMonthFontWeight: '600',
} as const;

export const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  assignments,
  selectedDate,
  onDayPress,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isExpanded, setIsExpanded] = useState(true);
  const [calendarKey, setCalendarKey] = useState(0);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCalendarKey((k) => k + 1), 0);
    return () => clearTimeout(timer);
  }, []);

  const initialDate = useMemo(() => CalendarUtils.getCalendarDateString(new Date()), []);

  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    assignments.forEach((assignment) => {
      const dateStr = CalendarUtils.getCalendarDateString(assignment.deadline);
      marked[dateStr] = { ...(marked[dateStr] || {}), marked: true, dotColor: colors.primary };
    });

    if (selectedDate) {
      const dateStr = CalendarUtils.getCalendarDateString(selectedDate);
      marked[dateStr] = {
        ...(marked[dateStr] || {}),
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.surface,
      };
    }

    return marked;
  }, [assignments, selectedDate]);

  const handleToggleView = (mode: ViewMode) => {
    setViewMode(mode);
    const shouldExpand = mode === 'month';
    if (calendarRef.current && shouldExpand !== isExpanded) {
      calendarRef.current.toggleCalendarPosition();
    }
  };

  const handleCalendarToggled = (open: boolean) => {
    setIsExpanded(open);
    setViewMode(open ? 'month' : 'week');
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {(['week', 'month'] as ViewMode[]).map((mode) => {
          const active = viewMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => handleToggleView(mode)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {mode === 'month' ? 'Month' : 'Week'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.calendarCard}>
        <CalendarProvider date={initialDate} theme={calendarTheme}>
          <ExpandableCalendar
            key={calendarKey}
            ref={calendarRef}
            markedDates={markedDates}
            onDayPress={(date) => onDayPress(date.dateString)}
            initialPosition={ExpandableCalendar.positions.OPEN}
            allowShadow={false}
            hideKnob
            disablePan
            theme={calendarTheme}
            onCalendarToggled={handleCalendarToggled}
          />
        </CalendarProvider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});