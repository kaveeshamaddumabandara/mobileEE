import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';

// Import screens
import WelcomeScreen from '../screens/common/WelcomeScreen';
import LoginScreen from '../screens/common/LoginScreen';
import CaregiverRegisterScreen from '../screens/common/CaregiverRegisterScreen';
import CareReceiverRegisterScreen from '../screens/common/CareReceiverRegisterScreen';
import ForgotPasswordScreen from '../screens/common/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="CaregiverRegister"
        component={CaregiverRegisterScreen}
      />
      <Stack.Screen
        name="CareReceiverRegister"
        component={CareReceiverRegisterScreen}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
