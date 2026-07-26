import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { useAssignmentsStore } from '../store/AssignmentsStore';
import { AssignmentType, Assignment } from '../types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DurationPicker } from '../components';
import DateTimePicker from '@react-native-community/datetimepicker';

const TYPE_OPTIONS: AssignmentType[] = ['homework', 'test', 'task', 'other'];




export const AddAssignmentScreen: React.FC = () => {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const { assignmentId } = route.params ?? {};

  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<AssignmentType>('homework');
  const [duration, setDuration] = useState<number>(60);
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');

//adding from the expo documentation for date and time picker
//https://github.com/react-native-datetimepicker/datetimepicker#component-props--params-of-the-android-imperative-api
  const [deadline, setDeadline] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);

  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const assignmentsStore = useAssignmentsStore();
  const addAssignmentStore = assignmentsStore.addAssignment;
  const updateAssignmentStore = assignmentsStore.updateAssignment;
  const loadAssignments = assignmentsStore.loadAssignments;

  const [customType, setCustomType] = useState('');

  // Load assignment if editing
  useEffect(() => {
    if (assignmentId) {
      setIsLoading(true);
      // Reload assignments to ensure we have latest data
      loadAssignments().then(() => {
        const assignment = assignmentsStore.assignments.find((a) => a.id === assignmentId);
        if (assignment) {
          setTitle(assignment.title);
          setSelectedType(assignment.type);
          setCustomType(assignment.customType ?? '');
          setDuration(assignment.duration);
          setHours(String(Math.floor(assignment.duration / 60)));
          setMinutes(String(assignment.duration % 60));

           setDeadline(assignment.deadline);

        setDescription(assignment.description ?? '');
          setDescription(assignment.description ?? '');
        }
        setIsLoading(false);
      });
    }
  }, [assignmentId, loadAssignments]);

  const saveAssignment = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your assignment.');
      return;
    }

    setIsLoading(true);
    try {
      
      const assignmentData = {
        title: title.trim(),
        type: selectedType,
        customType: customType.trim(),
        duration: (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0) || 60,
        deadline,
        description: description.trim(),
      };

      if (assignmentId) {
        // Update existing assignment
        const original = assignmentsStore.assignments.find((a) => a.id === assignmentId);
        if (original) {
          const updatedAssignment: Assignment = {
            id: assignmentId,
            title: assignmentData.title,
            type: assignmentData.type,
            customType: assignmentData.customType,
            duration: assignmentData.duration,
            deadline: assignmentData.deadline,
            description: assignmentData.description,
            status: original.status,
            coinReward: original.coinReward, // Keep existing, store will recalc
            createdAt: original.createdAt,
          };
          await updateAssignmentStore(updatedAssignment);
        }
      } else {
        // Add new assignment
        await addAssignmentStore(assignmentData);
      }
    } catch (e) {
      console.error('Failed to save assignment:', e);
      Alert.alert('Error', 'Failed to save assignment');
    } finally {
      setIsLoading(false);
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

  
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}
          style={styles.backButton} >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        
       
        <View />
         
     
      <Text style={styles.title}>{assignmentId ? 'Edit assignment' : 'Add Assignment'}</Text>
 </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="add title"
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Add Deadline</Text>


          <View style={styles.row}>

  <TouchableOpacity
  style={[styles.input, styles.flexHalf]}
  onPress={() => {
    setShowTimePicker(false);
    setShowDatePicker(true);
  }}
>
  <Text>
    {deadline.toLocaleDateString()}
  </Text>
</TouchableOpacity>


<TouchableOpacity
  style={[styles.input, styles.flexHalf]}
  onPress={() => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  }}
>
    <Text>
      {deadline.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Text>
  </TouchableOpacity>

</View>

          
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Type of Assignment</Text>
          <View style={styles.typeList}>
  {TYPE_OPTIONS.map((t) => (
    <TouchableOpacity
      key={t}
      style={[
        styles.typeOption,
        selectedType === t && styles.typeOptionSelected,
      ]}
      onPress={() => setSelectedType(t)}
    >
      <Text
        style={[
          styles.typeOptionText,
          selectedType === t && styles.typeOptionTextSelected,
        ]}
      >
        {t}
      </Text>
    </TouchableOpacity>
  ))}
</View>
        {selectedType === 'other' && (
    <TextInput
      value={customType}
       onChangeText={setCustomType}
      style={[styles.input, { marginTop: 12 }]}
      placeholder="Add Type.. 
      
      "
    />
  )}
</View>

        <View style={styles.card}>
          <Text style={styles.label}>Length of Assignment</Text>
          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={hours}
                onChangeText={setHours}
              />
              <Text style={styles.unitLabel}>hr</Text>
            </View>
            <View style={styles.flexHalf}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={minutes}
                onChangeText={setMinutes}
              />
              <Text style={styles.unitLabel}>min</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Add Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="description"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          
        </View>
        
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={saveAssignment}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>{assignmentId ? 'save' : 'Add'}</Text>
        </TouchableOpacity>


      </ScrollView>
        {showDatePicker && (
    <View style={{ alignItems: 'center' }}>
    <DateTimePicker
      value={deadline}
      mode="date"
      display="spinner"
      onChange={(event, selectedDate) => {
        setShowDatePicker(true);
        setShowTimePicker(false);
        if (selectedDate) {
          setDeadline(selectedDate);
        }
      }}
    />
    </View>
  )}

  {showTimePicker && (
    <View style={{ alignItems: 'center' }}>
    <DateTimePicker
      value={deadline}
      mode="time"
      display="spinner"
      onChange={(event, selectedTime) => {
         setShowTimePicker(false);

        if (selectedTime) {
  const updated = new Date(deadline);

  updated.setHours(
    selectedTime.getHours(),
    selectedTime.getMinutes()
  );

  setDeadline(updated);
}
      }}
    />
    </View>
  )}
 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginTop: -10,
    flex: 1, 
    backgroundColor: colors.background,
   
  },



  header: {

    
   
    paddingVertical:20,
    paddingHorizontal: 15,
 marginBottom: -20,
    
  },
backButton: {
  position: 'absolute',
      left: 25,
      paddingHorizontal: 13,
      paddingVertical: 10,
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
  fontSize: 25,
  color: 'white',
  fontWeight: '600',
},


  title: { 
    fontSize: 24, 
    alignSelf: 'center',
    marginTop: 15,
    fontWeight: '600',
   marginBottom: -10,
    color: colors.text,

    
  },
  content: { 
    padding: 25, 

  },
  card: { 
    backgroundColor: colors.surface, 
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20, 
    padding: 18, 
    
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
      
  },
  label: { 
    fontSize: 16, 
    color: colors.textSecondary, 
    marginBottom: 10,
    
  },
  unitLabel: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  input: { 
    backgroundColor: '#134FAA' + 15,
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16, 
    marginBottom: 8,
  
   


  },
  multiline: { 
    height: 100, 
    textAlignVertical: 'top',
  },
  row: { 
    flexDirection: 'row', 
    gap: 8,
  },
  flexHalf: { 
    flex: 1,

    
  },
  typeList: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
  },
  typeOption: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 9999, 
    backgroundColor: '#134FAA' + 15,
    borderWidth: 1, 
    borderColor: colors.border,
  },
  typeOptionSelected: { 
    backgroundColor: colors.primary, 
    borderColor: colors.primary,
  },
  typeOptionText: { 
    color: colors.text, 
    fontSize: 14,
    textTransform: 'capitalize',
  },
  typeOptionTextSelected: {
    color: colors.surface,
  },
  saveButton: {

    backgroundColor: colors.accentPink + '70',  
    paddingHorizontal: 60,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    
    elevation: 6,
 shadowOffset: {
  width: 0,
  height: 6,
},
shadowOpacity: 0.25,
shadowRadius: 10,
elevation: 8,},
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {

    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
