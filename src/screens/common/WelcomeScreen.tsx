import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types.ts';
import Icon from 'react-native-vector-icons/Feather';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1080&q=80',
        }}
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.overlay}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
                <Image
                  source={require('../../public/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
            </View>

            {/* Bottom Card Section */}
            <View style={styles.bottomCard}>
              <View style={styles.cardContent}>
                <Text style={styles.welcomeText}>Get Started</Text>
                <Text style={styles.welcomeSubtext}>
                  Join our community of compassionate care
                </Text>

                {/* Role Buttons */}
                <TouchableOpacity
                  style={[styles.roleButton, styles.careReceiverButton]}
                  onPress={() => navigation.navigate('CareReceiverRegister')}
                  activeOpacity={0.8}>
                  <View style={styles.roleButtonContent}>
                    <View style={styles.roleIconWrapper}>
                      <Icon name="home" size={22} color="#7c3aed" />
                    </View>
                    <View style={styles.roleTextWrapper}>
                      <Text style={styles.roleTitle}>Find a Caregiver</Text>
                      <Text style={styles.roleDescription}>
                        I need care services
                      </Text>
                    </View>
                    <Icon name="arrow-right" size={20} color="#9ca3af" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, styles.caregiverButton]}
                  onPress={() => navigation.navigate('CaregiverRegister')}
                  activeOpacity={0.8}>
                  <View style={styles.roleButtonContent}>
                    <View style={styles.roleIconWrapper}>
                      <Icon name="briefcase" size={22} color="#7c3aed" />
                    </View>
                    <View style={styles.roleTextWrapper}>
                      <Text style={styles.roleTitle}>Become a Caregiver</Text>
                      <Text style={styles.roleDescription}>
                        I provide care services
                      </Text>
                    </View>
                    <Icon name="arrow-right" size={20} color="#9ca3af" />
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.8}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#7c3aed',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    padding: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '400',
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
  },
  cardContent: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 28,
    lineHeight: 22,
  },
  roleButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  careReceiverButton: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  caregiverButton: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  roleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleTextWrapper: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  roleDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});

export default WelcomeScreen;
