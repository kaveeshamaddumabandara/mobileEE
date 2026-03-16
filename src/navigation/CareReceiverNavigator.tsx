import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CareReceiverTabParamList} from './types';
import Icon from 'react-native-vector-icons/Feather';

// Import screens
import CareReceiverDashboardScreen from '../screens/carereceiver/CareReceiverDashboardScreen';
import CareReceiverProfileScreen from '../screens/carereceiver/CareReceiverProfileScreen';
import CareReceiverBookingsScreen from '../screens/carereceiver/CareReceiverBookingsScreen';

const Tab = createBottomTabNavigator<CareReceiverTabParamList>();

const CareReceiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB', // Blue 600
        tabBarInactiveTintColor: '#9CA3AF', // Gray 400
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          borderWidth: 0,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={CareReceiverDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => (
            <Icon 
              name="home" 
              size={24} 
              color={color}
              style={{marginBottom: -3}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="FindCaregivers"
        component={CareReceiverDashboardScreen}
        options={{
          title: 'Find Caregivers',
          tabBarLabel: 'Find Care',
          tabBarIcon: ({color}) => (
            <Icon 
              name="search" 
              size={24} 
              color={color}
              style={{marginBottom: -3}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={CareReceiverBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({color}) => (
            <Icon 
              name="calendar" 
              size={24} 
              color={color}
              style={{marginBottom: -3}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CareReceiverProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Me',
          tabBarIcon: ({color}) => (
            <Icon 
              name="user" 
              size={24} 
              color={color}
              style={{marginBottom: -3}}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default CareReceiverNavigator;
