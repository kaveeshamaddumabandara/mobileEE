import React, {useState, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

// Import screens
import OnboardingScreen from '../screens/common/OnboardingScreen';
import WelcomeScreen from '../screens/common/WelcomeScreen';
import LoginScreen from '../screens/common/LoginScreen';
import CaregiverRegisterScreen from '../screens/common/CaregiverRegisterScreen';
import CareReceiverRegisterScreen from '../screens/common/CareReceiverRegisterScreen';
import ForgotPasswordScreen from '../screens/common/ForgotPasswordScreen';
import ContactUsScreen from '../screens/common/ContactUsScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

import {StyleSheet} from 'react-native';

const AuthNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={hasSeenOnboarding ? 'Welcome' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AuthNavigator;
