import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarProvider, CalendarUtils, ExpandableCalendar } from 'react-native-calendars';
import { Assignment } from '../types';
import { colors } from '../utils/colors';

type ViewMode = 'month' | 'week';

// Feature flag: gates the week/month switch. Off = month-only, functionality kept for later.
const SHOW_WEEK_MONTH_TOGGLE = false;

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
  const [calendarWidth, setCalendarWidth] = useState<number>(
    () => Dimensions.get('window').width - 60
  );

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

  const handleToggleView = useCallback((mode: ViewMode) => {
    const shouldExpand = mode === 'month';
    if (shouldExpand === isExpanded) return;
    setViewMode(mode);
    if (calendarRef.current) {
      calendarRef.current.toggleCalendarPosition();
    }
  }, [isExpanded]);

  const handleCalendarToggled = useCallback((open: boolean) => {
    if (!SHOW_WEEK_MONTH_TOGGLE) return;
    setIsExpanded(open);
    setViewMode(open ? 'month' : 'week');
  }, []);

  const handleLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setCalendarWidth((prev) => (w > 0 && prev !== undefined && Math.abs(w - prev) < 2 ? prev : w > 0 ? w : prev));
  }, []);

  const handleDayPressInternal = useCallback((date: { dateString: string }) => {
    onDayPress(date.dateString);
  }, [onDayPress]);

  return (
    <View style={styles.container}>
      {SHOW_WEEK_MONTH_TOGGLE && (
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
      )}

      <View
        style={styles.calendarCardWrapper}
        onLayout={handleLayout}
      >
        <View style={styles.calendarCardBackground} pointerEvents="none" />
        <CalendarProvider date={initialDate} theme={calendarTheme}>
          <ExpandableCalendar
            ref={calendarRef}
      markedDates={markedDates}
      onDayPress={handleDayPressInternal}
      onCalendarToggled={handleCalendarToggled}
      initialPosition={ExpandableCalendar.positions.OPEN}
      hideKnob
      disablePan={!SHOW_WEEK_MONTH_TOGGLE}
      allowShadow={false}
      closeOnDayPress={false}
      calendarWidth={calendarWidth}
      pastScrollRange={6}
      futureScrollRange={12}
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