import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarUtils } from 'react-native-calendars';
import { colors } from '../utils/colors';
import { useAssignmentsStore } from '../store/AssignmentsStore';
import { useNavigation } from '@react-navigation/native';
import { AssignmentCalendar } from '../components';

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation() as any;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { assignments, loadAssignments } = useAssignmentsStore();
  const [showMonthAssignments, setShowMonthAssignments] = useState(false);
const currentMonth = new Date().toLocaleDateString('en-US', {
  month: 'long',
});
  
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const pendingAssignments = useMemo(
    () => assignments.filter((a) => a.status === 'pending'),
    [assignments]
  );

  const handleDayPress = useCallback((dateString: string) => {
    setSelectedDate(new Date(`${dateString}T00:00:00`));
  }, []);
  const upcomingAssignments = useMemo(() => {
    const now = new Date();
    // Match the "Due this month" label: whole current calendar month, not a rolling 7-day window.
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return assignments
      .filter((a) => {
        if (a.status !== 'pending') return false;

        const deadline = new Date(a.deadline);

        return deadline >= monthStart && deadline < nextMonthStart;
      })
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() -
          new Date(b.deadline).getTime()
      );
  }, [assignments]);

  const selectedDayAssignments = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = CalendarUtils.getCalendarDateString(selectedDate);
    return assignments.filter((a) => {
      return a.status === 'pending' && CalendarUtils.getCalendarDateString(a.deadline) === dateStr;
    });
  }, [assignments, selectedDate]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}
                  style={styles.backButton} >
                    <Text style={styles.backButtonText}>{"←"}</Text>
                  </TouchableOpacity>
                
      
<View style={styles.calendarContainer}>
      <AssignmentCalendar
        assignments={pendingAssignments}
        selectedDate={selectedDate}
        onDayPress={handleDayPress}
      />

      
</View>




  <View style={styles.upcomingContainer}>

<View style={styles.sectionTitle}>  

<TouchableOpacity
  onPress={() => setShowMonthAssignments(!showMonthAssignments)}
>
  <Text style={styles.sectionTitleText}>
    {showMonthAssignments
      ? `▲ Due in ${currentMonth} ▲`
      : '▼ Due this month ▼'}
  </Text>
</TouchableOpacity>
</View>
{showMonthAssignments && (
  <>
    {upcomingAssignments.length === 0 ? (
      <Text style={styles.noAssignments}>
        Nothing due this month
      </Text>
    ) : (
      upcomingAssignments.map((assignment) => (
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
  </>
)}

  


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
  calendarContainer: {
    marginTop: 40,
  },

backButton: {
  position: 'absolute',
      left: 25,
      paddingHorizontal: 15,
      paddingVertical: 5,
  backgroundColor: colors.task,
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
  color: colors.white,
 

  
},

  assignmentsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 4,
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
backgroundColor: '#FFFFFF',
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
  upcomingContainer: {
  marginTop: 10,
  marginHorizontal: 20,

  borderRadius: 20,
  padding: 20,
},

sectionTitle: {
    backgroundColor: colors.task,
    paddingVertical: 8,
   
    borderRadius: 16,
    marginBottom: 12,

    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 20,
},
sectionTitleText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'white',
   alignSelf: 'center',

  },
upcomingTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: colors.text,
  marginBottom: 12,
},




upcomingItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
},
});