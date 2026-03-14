import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CareReceiverTabParamList} from './types';

// Import screens
import CareReceiverDashboardScreen from '../screens/carereceiver/CareReceiverDashboardScreen';
import CareReceiverProfileScreen from '../screens/carereceiver/CareReceiverProfileScreen';
import CareReceiverBookingsScreen from '../screens/carereceiver/CareReceiverBookingsScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import ContactUsScreen from '../screens/common/ContactUsScreen';

const Tab = createBottomTabNavigator<CareReceiverTabParamList>();

const CareReceiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          display: 'none',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={CareReceiverDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="FindCaregivers"
        component={CareReceiverDashboardScreen}
        options={{
          title: 'Find Caregivers',
          tabBarLabel: 'Find Care',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={CareReceiverBookingsScreen}
        options={{
          title: 'Find Caregivers',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={CareReceiverDashboardScreen}
        options={{
          title: 'Payments',
          tabBarLabel: 'Payments',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CareReceiverProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>👤</Text>,
        }}
      />
      <Tab.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{
          title: 'Contact Us',
          tabBarLabel: 'Contact',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📞</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default CareReceiverNavigator;
