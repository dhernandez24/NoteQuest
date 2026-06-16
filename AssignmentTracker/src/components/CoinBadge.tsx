import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../utils/colors';

interface CoinBadgeProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
}

export const CoinBadge: React.FC<CoinBadgeProps> = ({ amount, size = 'medium' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 8, 
          paddingVertical: 4, 
          fontSize: 12,
          iconSize: 25,
        };
      case 'large':
        return { paddingHorizontal: 16, 
          paddingVertical: 6, 
          fontSize: 18,
          iconSize: 25,
        };
      default:
        return { paddingHorizontal: 12, 
          paddingVertical: 6, 
          fontSize: 14,
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, { paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical }]}>
      <Image
        source={require('../../assets/coin.png')}
        style={[styles.icon, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}
      />
      <Text style={[styles.amount, { fontSize: sizeStyles.fontSize }]}>{amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '20',
    borderRadius: 20,
  },
  icon: {
    marginRight: 4,
  },
  amount: {
    fontWeight: '600',
    color: colors.secondary,
  },
});
