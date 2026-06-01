import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from './types';

// Import screens
import CaregiverDashboardScreen from '../screens/caregiver/CaregiverDashboardScreen';
import CaregiverProfileScreen from '../screens/caregiver/CaregiverProfileScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CaregiverBookingsScreen from '../screens/caregiver/CaregiverBookingsScreen';
// @ts-ignore - Module exists but TypeScript cache issue
import CareDocumentationScreen from '../screens/caregiver/CareDocumentationScreen';
import CaregiverPaymentScreen from '../screens/caregiver/CaregiverPaymentScreen';
import ContactUsScreen from '../screens/common/ContactUsScreen';
import AboutUsScreen from '../screens/common/AboutUsScreen';

const Stack = createNativeStackNavigator<CaregiverTabParamList>();

const CaregiverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Dashboard"
        component={CaregiverDashboardScreen}
      />
      <Stack.Screen
        name="Bookings"
        component={CaregiverBookingsScreen}
      />
      <Stack.Screen
        name="CareDocumentation"
        component={CareDocumentationScreen}
      />
      <Stack.Screen
        name="Profile"
        component={CaregiverProfileScreen}
      />
      <Stack.Screen name="Payments" component={CaregiverPaymentScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
    </Stack.Navigator>
  );
};

export default CaregiverNavigator;
