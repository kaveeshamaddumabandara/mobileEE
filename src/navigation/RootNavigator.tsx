import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {RootStackParamList} from './types';

// Import navigators
import AuthNavigator from './AuthNavigator';
import CaregiverNavigator from './CaregiverNavigator';
import CareReceiverNavigator from './CareReceiverNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'caregiver' ? (
          <Stack.Screen name="CaregiverApp" component={CaregiverNavigator} />
        ) : (
          <Stack.Screen
            name="CareReceiverApp"
            component={CareReceiverNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
