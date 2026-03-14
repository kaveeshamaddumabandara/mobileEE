import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types.ts';
import Icon from 'react-native-vector-icons/Feather';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1758686254373-705c267c0bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwcGVvcGxlJTIwaGFwcHklMjB0YWxraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzY4NjY5NDI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        }}
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.overlay}>
            <View style={styles.content}>
            {/* Welcome Text */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to ElderEase</Text>
              <Text style={styles.subtitle}>
                Connecting caregivers with those who need compassionate care
              </Text>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleTitle}>I am a...</Text>

              {/* Care Receiver Button */}
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => navigation.navigate('CareReceiverRegister')}
                activeOpacity={0.7}>
                <View style={[styles.iconContainer, styles.careReceiverIcon]}>
                  <Icon name="heart" size={28} color="#2563eb" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleButtonTitle}>Care Receiver</Text>
                  <Text style={styles.roleButtonSubtitle}>
                    Looking for caregiving services
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Caregiver Button */}
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => navigation.navigate('CaregiverRegister')}
                activeOpacity={0.7}>
                <View style={[styles.iconContainer, styles.caregiverIcon]}>
                  <Icon name="users" size={28} color="#9333ea" />
                </View>
                <View style={styles.roleTextContainer}>
                  <Text style={styles.roleButtonTitle}>Caregiver</Text>
                  <Text style={styles.roleButtonSubtitle}>
                    Provide professional care services
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  roleContainer: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  roleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  careReceiverIcon: {
    backgroundColor: '#dbeafe',
  },
  caregiverIcon: {
    backgroundColor: '#f3e8ff',
  },
  roleTextContainer: {
    flex: 1,
  },
  roleButtonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  roleButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signInText: {
    fontSize: 16,
    color: '#4b5563',
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  signInLink: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
