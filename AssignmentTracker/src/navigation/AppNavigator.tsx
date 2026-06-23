import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet , Image} from 'react-native';
import { HomeScreen, CalendarScreen, RewardsScreen, AddAssignmentScreen, CompletedAssignmentsScreen } from '../screens';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import { ImageSourcePropType } from 'react-native';

const TabIcon: React.FC<{
  label: string;
  focused: boolean;
  icon: ImageSourcePropType;
}> = ({ label, focused, icon }) => (
  <View style={styles.tabIconContainer}>
    <Image
      source={icon}
      style={[
        { width: 70, height: 70, tintColor: focused ? colors.primary : colors.textSecondary }
      ]}
      resizeMode="contain"
    />
    <Text
  numberOfLines={1}
  style={[styles.tabLabel, focused && styles.tabLabelFocused]}
>
  {label}
</Text>
  </View>
);

const Tabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}
  >
    <Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarIcon: ({ focused }) => (
      <TabIcon
        label="Home"
        focused={focused}
        icon={require('../../assets/houseIcon.png')}
      />
    ),
  }}
/>
 <Tab.Screen
  name="Rewards"
  component={RewardsScreen}
  options={{
    tabBarIcon: ({ focused }) => (
      <TabIcon
        label="Games"
        focused={focused}
        icon={require('../../assets/gameIcon.png')}
      />
    ),
  }}
/>
  <Tab.Screen
  name="Calendar"
  component={CalendarScreen}
  options={{
    tabBarIcon: ({ focused }) => (
      <TabIcon
        label="Calendar"
        focused={focused}
        icon={require('../../assets/calenderIcon.png')}
      />
    ),
  }}
/>


   
    
    
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
   
    bottom: 50,
    width: '90%',
    alignSelf: 'center',
    height: 70,
    backgroundColor: colors.surface,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,

    
  },
  tabIconContainer: {
    
    flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  width: 100,
  marginTop: 10,
   


  },
  tabIcon: {
    fontSize: 24,
    alignSelf: 'center',
  
    opacity: 0.5,

  },
  tabIconFocused: {
    opacity: 1,
    tintColor: colors.primary,
  
  },
  tabLabel: {
     fontSize: 11,
     marginTop: -6,
   

  fontWeight: '500',
  color: colors.textSecondary,
  flexWrap: 'nowrap',  
  },
  tabLabelFocused: {
    color: colors.textSecondary,
  },
});
