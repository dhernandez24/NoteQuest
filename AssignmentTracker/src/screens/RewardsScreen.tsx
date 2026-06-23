import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockUser } from '../data/mockData';
import { CoinBadge } from '../components';
import { colors } from '../utils/colors';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'theme' | 'game' | 'badge';
}

const rewardItems: RewardItem[] = [
  {
    id: '1',
    name: 'Dark Mode',
    description: 'Enable dark theme for the app',
    cost: 50,
    icon: '🌙',
    type: 'theme',
  },
  {
    id: '2',
    name: 'Coin Flip Game',
    description: 'Flip coins to win more coins!',
    cost: 25,
    icon: '🪙',
    type: 'game',
  },
  {
    id: '3',
    name: 'Streak Badge',
    description: 'Show off your 7-day streak',
    cost: 30,
    icon: '🔥',
    type: 'badge',
  },
  {
    id: '4',
    name: 'Ocean Theme',
    description: 'Calming blue color scheme',
    cost: 75,
    icon: '🌊',
    type: 'theme',
  },
  {
    id: '5',
    name: 'Number Guess',
    description: 'Guess the number, win coins',
    cost: 20,
    icon: '🔢',
    type: 'game',
  },
  {
    id: '6',
    name: 'Star Badge',
    description: 'Complete 10 assignments',
    cost: 40,
    icon: '⭐',
    type: 'badge',
  },
];

export const RewardsScreen: React.FC = () => {
  const userBalance = mockUser.coinBalance;

  const handlePurchase = (item: RewardItem) => {
    // Mock purchase functionality
    console.log('Purchased:', item.name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        

        <View style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <View style={styles.balanceRow}>
              <Image
                      source={require('../../assets/coin.png')}
                      style={styles.coinIcon}
                    />
              <Text style={styles.balanceAmount}>{userBalance}</Text>
            </View>
          </View>
          <View style={styles.decorativeCircle} />
        </View>

        <Text style={styles.sectionTitle}>Available Rewards</Text>

        <View style={styles.categories}>
          <TouchableOpacity style={[styles.categoryTab, styles.categoryTabActive]}>
            <Text style={[styles.categoryText, styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryText}>Themes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryText}>Games</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryText}>Badges</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rewardsGrid}>
          {rewardItems.map((item) => {
            const canAfford = userBalance >= item.cost;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}
                onPress={() => handlePurchase(item)}
                activeOpacity={0.7}
              >
                <View style={styles.rewardIcon}>
                  <Text style={styles.rewardEmoji}>{item.icon}</Text>
                </View>
                <Text style={styles.rewardName}>{item.name}</Text>
                <Text style={styles.rewardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={[styles.costBadge, !canAfford && styles.costBadgeDisabled]}>
                  <Image
                      source={require('../../assets/coin.png')}
                      style={styles.coinIcon}
                    />
                  <Text style={[styles.costAmount, !canAfford && styles.costAmountDisabled]}>
                    {item.cost}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    
    overflow: 'hidden',
    position: 'relative',
  },
  balanceContent: {
    zIndex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.surface + 'CC',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  

  coinIcon: {
  width: 70,
  height: 70,
  marginRight: -10,
  marginLeft: -20,
  resizeMode: 'contain',
},
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.surface,
  },
  decorativeCircle: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface + '10',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.surface,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 9,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -15,



  
  },
  costBadgeDisabled: {
  
  },
  costIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  costAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  costAmountDisabled: {
    color: colors.textSecondary,
  },
});
