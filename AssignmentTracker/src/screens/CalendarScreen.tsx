import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockAssignments } from '../data/mockData';
import { colors } from '../utils/colors';
import { Assignment } from '../types';
import { useNavigation, useRoute } from '@react-navigation/native'; 
export const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
   const navigation = useNavigation() as any;
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getAssignmentsForDate = (day: number): Assignment[] => {
    return mockAssignments.filter((a) => {
      const assignmentDate = a.deadline;
      return (
        assignmentDate.getDate() === day &&
        assignmentDate.getMonth() === currentDate.getMonth() &&
        assignmentDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const hasAssignments = (day: number): boolean => {
    return getAssignmentsForDate(day).length > 0;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayPress = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const selectedDayAssignments = selectedDate ? getAssignmentsForDate(selectedDate.getDate()) : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}
                  style={styles.backButton} >
                    <Text style={styles.backButtonText}>x</Text>
                  </TouchableOpacity>
                
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}> ‹ </Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {dayNames.map((day) => (
            <View key={day} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            const isSelected =
              selectedDate &&
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear();
            const hasDots = day && hasAssignments(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => day && handleDayPress(day)}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.todayText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {day}
                    </Text>
                    {hasDots && (
                      <View style={styles.dotsContainer}>
                        <View style={styles.dot} />
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedDate && (
        <View style={styles.assignmentsContainer}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedDayAssignments.length === 0 ? (
              <Text style={styles.noAssignments}>No assignments due</Text>
            ) : (
              selectedDayAssignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentItem}>
                  <View
                    style={[
                      styles.typeIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Text style={styles.assignmentTime}>
                      Due at{' '}
                      {assignment.deadline.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  header: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    margin: 20,
    marginTop: 8,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

backButton: {
  position: 'absolute',
      left: 25,
      paddingHorizontal: 15,
      paddingVertical: 5,
  backgroundColor: colors.primary,
  borderRadius: 99999,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 8,
 

},

backButtonText: {
  fontSize: 30,
  color: 'white',
 

  
},


  navButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 18,
  },
  navButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '300',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  selectedCell: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.surface,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  assignmentsContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  noAssignments: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  typeIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  assignmentTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
