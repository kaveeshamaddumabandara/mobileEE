import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CareReceiverTabParamList} from './types';

// Import screens
import CareReceiverDashboardScreen from '../screens/carereceiver/CareReceiverDashboardScreen';
import CareReceiverProfileScreen from '../screens/carereceiver/CareReceiverProfileScreen';
import CareReceiverBookingsScreen from '../screens/carereceiver/CareReceiverBookingsScreen';
import ContactUsScreen from '../screens/common/ContactUsScreen';
import AboutUsScreen from '../screens/common/AboutUsScreen';
import ReviewsRatingsScreen from '../screens/carereceiver/ReviewsRatingsScreen';

const Stack = createNativeStackNavigator<CareReceiverTabParamList>();

const CareReceiverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Dashboard"
        component={CareReceiverDashboardScreen}
      />
      <Stack.Screen
        name="FindCaregivers"
        component={CareReceiverBookingsScreen}
      />

      <Stack.Screen
        name="Profile"
        component={CareReceiverProfileScreen}
      />
      <Stack.Screen
        name="ContactUs"
        component={ContactUsScreen}
      />
      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
      />
      <Stack.Screen
        name="ReviewsRatings"
        component={ReviewsRatingsScreen}
      />
    </Stack.Navigator>
  );
};

export default CareReceiverNavigator;
