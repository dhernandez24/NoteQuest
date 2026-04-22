import React, { useState } from 'react';
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
import { AssignmentType } from '../types';

const TYPE_OPTIONS: AssignmentType[] = ['homework', 'test', 'task', 'other'];

export const AddAssignmentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<AssignmentType>('homework');
  const [duration, setDuration] = useState<string>('60');
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [deadlineTime, setDeadlineTime] = useState<string>('3:00 PM');
  const [description, setDescription] = useState('');

  const addAssignmentStore = useAssignmentsStore((state) => state.addAssignment);

  const addAssignment = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your assignment.');
      return;
    }

    const deadline = deadlineDate
      ? new Date(`${deadlineDate} ${deadlineTime}`)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await addAssignmentStore({
      title: title.trim(),
      type: selectedType,
      duration: parseInt(duration, 10) || 60,
      deadline,
      description: description.trim(),
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>adding assignment</Text>

        <View style={styles.card}>
          <Text style={styles.label}>title:</Text>
          <TextInput
            style={styles.input}
            placeholder="add title"
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>add deadline</Text>
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
          <Text style={styles.label}>type of assignment</Text>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>length of assignment</Text>
          <TextInput
            style={styles.input}
            placeholder="minutes"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>add description</Text>
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

        {/* Floating Add Button - matching prototype style */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={addAssignment}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
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
  content: { 
    padding: 20, 
    paddingBottom: 100,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: colors.text, 
    marginBottom: 12,
    textTransform: 'none',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentPink || '#F472B6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.accentPink || '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '400',
    marginTop: -2,
  },
});
