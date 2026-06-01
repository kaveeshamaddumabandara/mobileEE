/**
 * CareConnect Mobile App
 * Connecting Caregivers and Care Receivers
 *
 * @format
 */

import React from 'react';
import {StatusBar, StyleSheet, ActivityIndicator, View, Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StripeProvider} from '@stripe/stripe-react-native';
import {AuthProvider} from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import ApiService from './src/services/api';

function App(): React.JSX.Element {
  const [stripePublishableKey, setStripePublishableKey] = React.useState('');
  const [stripeLoading, setStripeLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const {publishableKey} = await ApiService.getStripeConfig();
        setStripePublishableKey(publishableKey);
      } catch (error) {
        console.error('Failed to load Stripe config:', error);
      } finally {
        setStripeLoading(false);
      }
    };

    loadStripeConfig();
  }, []);

  if (stripeLoading) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loadingText}>Loading payment configuration...</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (!stripePublishableKey) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Payment gateway is not configured. Please contact support.</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={stripePublishableKey}>
          <AuthProvider>
            <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
            <RootNavigator />
          </AuthProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#374151',
    fontSize: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default App;
