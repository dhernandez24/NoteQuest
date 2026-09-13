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
  selectedDotColor: colors.accentPink,
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
  
  const calendarRef = useRef<any>(null);
  const [calendarWidth, setCalendarWidth] = useState<number | undefined>(undefined);

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

      <View
        style={styles.calendarCardWrapper}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w > 0 && w !== calendarWidth) setCalendarWidth(w);
        }}
      >
        <View style={styles.calendarCardBackground} pointerEvents="none" />
        <CalendarProvider date={initialDate} theme={calendarTheme}>
          <ExpandableCalendar
            ref={calendarRef}
      markedDates={markedDates}
      onDayPress={(date) => onDayPress(date.dateString)}
      initialPosition={ExpandableCalendar.positions.OPEN}
      hideKnob
      allowShadow={false}
      calendarWidth={calendarWidth}
          />
        </CalendarProvider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    marginTop: 8,
  },
  segmentedControl: {
    marginHorizontal: 85,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 35,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'lightgrey',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 35,
    alignItems: 'center',
   
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  calendarCardWrapper: {
  marginHorizontal: 10,
  position: 'relative',
  minHeight: 350,
  },
  calendarCardBackground: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.surface,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
  },
});