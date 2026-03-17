import React from 'react';
import {StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';

// Import navigators
import AuthNavigator from './AuthNavigator';
import CaregiverNavigator from './CaregiverNavigator';
import CareReceiverNavigator from './CareReceiverNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: styles.container,
      }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="CaregiverApp" component={CaregiverNavigator} />
      <Stack.Screen name="CareReceiverApp" component={CareReceiverNavigator} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
