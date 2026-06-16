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
    alignSelf: 'center',
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: '#6F9CEB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width:100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    position: 'absolute',
    width: 50,
    height: 5,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  vertical: {
    position: 'absolute',
    width: 5,
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
});
