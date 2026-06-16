import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';
import { CoinBadge } from './CoinBadge';

interface UserCardProps {
  name: string;
  coinBalance: number;
}

export const UserCard: React.FC<UserCardProps> = ({ name, coinBalance }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <CoinBadge amount={coinBalance} size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:  '#f4d35e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.surface,
  },
  info: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});
