import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

interface FloatingButtonProps {
  onPress: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8} accessibilityLabel="Add Assignment">
      <View style={styles.iconContainer}>
        <View style={styles.horizontal} />
        <View style={styles.vertical} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    position: 'absolute',
    width: 24,
    height: 3,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  vertical: {
    position: 'absolute',
    width: 3,
    height: 24,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
});
