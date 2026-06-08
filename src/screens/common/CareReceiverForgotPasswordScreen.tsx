import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types.ts';
import ApiService from '../../services/api';
import Icon from 'react-native-vector-icons/Feather';

type Props = {
  navigation: NativeStackNavigationProp<
    AuthStackParamList,
    'CareReceiverForgotPassword'
  >;
};

const CareReceiverForgotPasswordScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await ApiService.forgotPassword(trimmedEmail);
      Alert.alert(
        'Email Sent',
        'Check your inbox for a "Mobile Reset Code". Tap Continue to enter it and set your new password.',
        [
          {
            text: 'Continue',
            onPress: () =>
              navigation.navigate('ResetPassword', {email: trimmedEmail}),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send reset email. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Icon name="key" size={40} color="#059669" />
            </View>
            <Text style={styles.roleBadge}>Care Receiver</Text>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered care receiver email and we'll send you
              instructions to reset your password
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Care Receiver Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="mail"
                  size={20}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your care receiver email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  <Icon name="send" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.navigate('Login')}>
              <Icon name="arrow-left" size={18} color="#059669" />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Icon name="info" size={20} color="#059669" />
            <Text style={styles.infoText}>
              Check your spam folder if you don't receive the email. The reset
              code expires in 10 minutes.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  roleBadge: {
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  backToLoginText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
});

export default CareReceiverForgotPasswordScreen;
