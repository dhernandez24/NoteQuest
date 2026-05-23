import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { HomeScreen, CalendarScreen, RewardsScreen, AddAssignmentScreen, CompletedAssignmentsScreen } from '../screens';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon: React.FC<{ label: string; focused: boolean; icon: string }> = ({ label, focused, icon }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

const Tabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} icon="🏠" /> }} />
    <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Calendar" focused={focused} icon="📅" /> }} />
    <Tab.Screen name="Rewards" component={RewardsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Rewards" focused={focused} icon="🎁" /> }} />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="AddAssignment" component={AddAssignmentScreen} />
      <Stack.Screen name="CompletedAssignments" component={CompletedAssignmentsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 70,
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 0,
    paddingBottom: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabLabelFocused: {
    color: colors.primary,
  },
});
