import React from 'react';
import {StyleSheet, ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {useAuth} from '../context/AuthContext';

// Import navigators
import AuthNavigator from './AuthNavigator';
import CaregiverNavigator from './CaregiverNavigator';
import CareReceiverNavigator from './CareReceiverNavigator';

// Import pending screen (standalone, not inside a tab navigator)
import CaregiverPendingScreen from '../screens/caregiver/CaregiverPendingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Determine which root screen to show for a logged-in caregiver:
  //   1. Not yet verified (admin hasn't approved) → Pending screen
  //   2. Verified but fee not paid → Full CaregiverApp (Payment tab shows the fee flow)
  //   3. Verified + fee paid → Full CaregiverApp
  const getCaregiverScreen = () => {
    if (!user?.isVerified) {
      return (
        <Stack.Screen name="CaregiverPending" component={CaregiverPendingScreen} />
      );
    }
    return <Stack.Screen name="CaregiverApp" component={CaregiverNavigator} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: styles.container,
        }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'caregiver' ? (
          getCaregiverScreen()
        ) : (
          <Stack.Screen name="CareReceiverApp" component={CareReceiverNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;
