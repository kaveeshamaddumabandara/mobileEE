import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CaregiverTabParamList} from './types';

// Import screens
import CaregiverDashboardScreen from '../screens/caregiver/CaregiverDashboardScreen';
import CaregiverProfileScreen from '../screens/caregiver/CaregiverProfileScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CaregiverBookingsScreen from '../screens/caregiver/CaregiverBookingsScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CareDocumentationScreen from '../screens/caregiver/CareDocumentationScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CaregiverPaymentScreen from '../screens/caregiver/CaregiverPaymentScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import ContactUsScreen from '../screens/common/ContactUsScreen';

const Tab = createBottomTabNavigator<CaregiverTabParamList>();

const CaregiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b5cf6',
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
        component={CaregiverDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={CaregiverBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="CareDocumentation"
        component={CareDocumentationScreen}
        options={{
          title: 'Care Docs',
          tabBarLabel: 'Care Docs',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="Requests"
        component={CaregiverDashboardScreen}
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={CaregiverPaymentScreen}
        options={{
          title: 'Payments',
          tabBarLabel: 'Payments',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CaregiverProfileScreen}
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

export default CaregiverNavigator;
