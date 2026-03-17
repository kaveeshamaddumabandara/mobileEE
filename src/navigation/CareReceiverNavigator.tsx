import React from 'react';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CareReceiverTabParamList} from './types';
import Icon from 'react-native-vector-icons/Feather';

// Import screens
import CareReceiverDashboardScreen from '../screens/carereceiver/CareReceiverDashboardScreen';
import CareReceiverProfileScreen from '../screens/carereceiver/CareReceiverProfileScreen';
import CareReceiverBookingsScreen from '../screens/carereceiver/CareReceiverBookingsScreen';

const Tab = createBottomTabNavigator<CareReceiverTabParamList>();

// Extract tabBarIcon functions to avoid nested components
const HomeTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="home" size={size} color={color} />
);

const SearchTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="search" size={size} color={color} />
);

const UserTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="user" size={size} color={color} />
);

const dashboardOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: HomeTabIcon,
};

const findCaregiversOptions = {
  tabBarLabel: 'Find & Book',
  tabBarIcon: SearchTabIcon,
};

const profileOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: UserTabIcon,
};

const CareReceiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1D4ED8', // Blue 700
        tabBarInactiveTintColor: '#9CA3AF', // Gray 400
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={CareReceiverDashboardScreen}
        options={dashboardOptions}
      />
      <Tab.Screen
        name="FindCaregivers"
        component={CareReceiverBookingsScreen}
        options={findCaregiversOptions}
      />
      
      <Tab.Screen
        name="Profile"
        component={CareReceiverProfileScreen}
        options={profileOptions}
      />
    </Tab.Navigator>
  );
};

export default CareReceiverNavigator;
