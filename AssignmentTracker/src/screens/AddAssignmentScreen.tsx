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

const TYPE_OPTIONS: AssignmentType[] = ['homework', 'test', 'task', 'other'];




export const AddAssignmentScreen: React.FC = () => {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const { assignmentId } = route.params ?? {};

  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<AssignmentType>('homework');
  const [duration, setDuration] = useState<number>(60);
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [deadlineTime, setDeadlineTime] = useState<string>('3:00 PM');
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
          // Format deadline date and time
          const deadline = assignment.deadline;
          setDeadlineDate(deadline.toLocaleDateString('en-CA')); // YYYY-MM-DD
          setDeadlineTime(deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
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
      const deadline = deadlineDate
        ? new Date(`${deadlineDate} ${deadlineTime}`)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const assignmentData = {
        title: title.trim(),
        type: selectedType,
        customType: customType.trim(),
        duration: duration || 60,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <TouchableOpacity
           onPress={() => navigation.goBack()}
          style={styles.backButton} >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <Text style={styles.title}>{assignmentId ? 'edit assignment' : 'adding assignment'}</Text>
        <View style={{ width: 30 }} />
        
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
            <TextInput
              style={[styles.input, styles.flexHalf]}
              placeholder="Date"
              placeholderTextColor={colors.textLight}
              value={deadlineDate}
              onChangeText={setDeadlineDate}
            />
            <TextInput
              style={[styles.input, styles.flexHalf]} 
              placeholder="Time"
              placeholderTextColor={colors.textLight}
              value={deadlineTime}
              onChangeText={setDeadlineTime}
            />
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
          <DurationPicker value={duration} onChange={setDuration} />
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

        {/* Save Button - matching prototype style */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={saveAssignment}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>{assignmentId ? 'save' : 'add'}</Text>
        </TouchableOpacity>
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
  paddingHorizontal: 10,

},

backButtonText: {
  fontSize: 28,
  color: colors.text,
  fontWeight: '300',
},
  title: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: colors.text, 
    marginBottom: 12,
    textTransform: 'none',
    flex: 1,
    textAlign: 'center',
  },
  content: { 
    padding: 20, 
    paddingBottom: 100,
  },
  card: { 
    backgroundColor: colors.surface, 
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
    fontSize: 14, 
    color: colors.textSecondary, 
    marginBottom: 8,
  },
  input: { 
    backgroundColor: colors.background, 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: colors.border,
    color: colors.text,
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
    backgroundColor: colors.background, 
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
    marginTop: 24,
    backgroundColor: colors.accentPink || '#F472B6',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accentPink || '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
