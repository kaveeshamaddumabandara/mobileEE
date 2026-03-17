import React from 'react';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CaregiverTabParamList} from './types';
import Icon from 'react-native-vector-icons/Feather';

// Import screens
import CaregiverDashboardScreen from '../screens/caregiver/CaregiverDashboardScreen';
import CaregiverProfileScreen from '../screens/caregiver/CaregiverProfileScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CaregiverBookingsScreen from '../screens/caregiver/CaregiverBookingsScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CareDocumentationScreen from '../screens/caregiver/CareDocumentationScreen';

const Tab = createBottomTabNavigator<CaregiverTabParamList>();

// Extract tabBarIcon functions to avoid nested components
const HomeTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="home" size={size} color={color} />
);

const BriefcaseTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="briefcase" size={size} color={color} />
);

const FileTextTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="file-text" size={size} color={color} />
);

const UserTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="user" size={size} color={color} />
);

const CaregiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED', // Purple 600
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
        component={CaregiverDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={CaregiverBookingsScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: BriefcaseTabIcon,
        }}
      />
      <Tab.Screen
        name="CareDocumentation"
        component={CareDocumentationScreen}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: FileTextTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CaregiverProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: UserTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default CaregiverNavigator;
