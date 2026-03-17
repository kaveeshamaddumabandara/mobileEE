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
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';

type CareReceiverRegisterScreenProps = {
  navigation: NativeStackNavigationProp<
    AuthStackParamList,
    'CareReceiverRegister'
  >;
};

const CareReceiverRegisterScreen: React.FC<
  CareReceiverRegisterScreenProps
> = ({navigation}) => {
  const {register, logout} = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    // Address
    address: '',
    city: '',
    district: '',
    // Account Security
    password: '',
    confirmPassword: '',
    // Special Concerns
    medicalConditions: '',
    careRequirements: '',
  });
  const [loading, setLoading] = useState(false);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1;
    return strength;
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength <= 2) return '#f59e0b';
    if (passwordStrength <= 3) return '#eab308';
    if (passwordStrength <= 4) return '#84cc16';
    return '#22c55e';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const handleRegister = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'carereceiver',
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        district: formData.district || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
        medicalConditions: formData.medicalConditions || undefined,
        careRequirements: formData.careRequirements || undefined,
      });
      // Navigation will be handled by the navigation structure
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create account';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    
    switch(option) {
      case 'about':
        Alert.alert('About Us', 'ElderEase connects caregivers with those who need compassionate care. Our platform makes it easy to find trusted professionals.');
        break;
      case 'contact':
        Alert.alert('Contact Us', 'For support, please email us at support@elderease.com or call +1 (555) 123-4567');
        break;
      case 'help':
        Alert.alert('Help', 'Need assistance? Visit our help center or contact support.\n\nCommon topics:\n• Account setup\n• Registration process\n• Finding caregivers');
        break;
      case 'logout':
        Alert.alert(
          'Logout',
          'Are you sure you want to logout? Your registration progress will be lost.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Logout',
              style: 'destructive',
              onPress: () => {
                logout();
                navigation.navigate('Welcome');
              },
            },
          ]
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Side Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Icon name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('about')}>
                <Icon name="info" size={20} color="#6b7280" />
                <Text style={styles.menuItemText}>About Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('contact')}>
                <Icon name="mail" size={20} color="#6b7280" />
                <Text style={styles.menuItemText}>Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('help')}>
                <Icon name="help-circle" size={20} color="#6b7280" />
                <Text style={styles.menuItemText}>Help</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption('logout')}>
                <Icon name="log-out" size={20} color="#ef4444" />
                <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Logo and Title */}
        <View style={styles.titleSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../public/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Register as Care Receiver</Text>
          <Text style={styles.subtitle}>Create your care receiver account</Text>
        </View>

        <View style={styles.formContainer}>
              {/* Personal Information Card */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="user" size={22} color="#2563eb" />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChangeText={value => updateFormData('name', value)}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChangeText={value => updateFormData('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChangeText={value => updateFormData('phone', value)}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date of Birth *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={formData.dateOfBirth}
                      onChangeText={value => updateFormData('dateOfBirth', value)}
                    />
                  </View>
                </View>
              </View>

              {/* Address Card */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="map-pin" size={22} color="#2563eb" />
                  <Text style={styles.sectionTitle}>Address</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Street Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your address"
                      value={formData.address}
                      onChangeText={value => updateFormData('address', value)}
                      multiline
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your city"
                      value={formData.city}
                      onChangeText={value => updateFormData('city', value)}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>District</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your district"
                      value={formData.district}
                      onChangeText={value => updateFormData('district', value)}
                    />
                  </View>
                </View>
              </View>

              {/* Emergency Contact Card */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="phone-call" size={22} color="#2563eb" />
                  <Text style={styles.sectionTitle}>Emergency Contact</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contact Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Contact person name"
                      value={formData.emergencyContactName}
                      onChangeText={value =>
                        updateFormData('emergencyContactName', value)
                      }
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contact Phone</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Contact phone number"
                      value={formData.emergencyContactPhone}
                      onChangeText={value =>
                        updateFormData('emergencyContactPhone', value)
                      }
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Relationship</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Spouse, Child, Parent"
                      value={formData.emergencyContactRelationship}
                      onChangeText={value =>
                        updateFormData('emergencyContactRelationship', value)
                      }
                    />
                  </View>
                </View>
              </View>

              {/* Special Concerns Card */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="heart" size={22} color="#2563eb" />
                  <Text style={styles.sectionTitle}>Special Concerns</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Medical Conditions</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="List any medical conditions or allergies"
                      value={formData.medicalConditions}
                      onChangeText={value =>
                        updateFormData('medicalConditions', value)
                      }
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Care Requirements</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Describe your care needs"
                      value={formData.careRequirements}
                      onChangeText={value =>
                        updateFormData('careRequirements', value)
                      }
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </View>

              {/* Account Security Card */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="lock" size={22} color="#2563eb" />
                  <Text style={styles.sectionTitle}>Account Security</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChangeText={value => updateFormData('password', value)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}>
                        <Icon 
                          name={showPassword ? "eye" : "eye-off"} 
                          size={18} 
                          color="#6b7280" 
                        />
                      </TouchableOpacity>
                    </View>
                    {formData.password.length > 0 && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBarBackground}>
                          <View
                            style={[
                              styles.strengthBarFill,
                              {
                                width: `${(passwordStrength / 5) * 100}%`,
                                backgroundColor: getStrengthColor(),
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.strengthText, {color: getStrengthColor()}]}>
                          {getStrengthText()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChangeText={value =>
                          updateFormData('confirmPassword', value)
                        }
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}>
                        <Icon 
                          name={showConfirmPassword ? "eye" : "eye-off"} 
                          size={18} 
                          color="#6b7280" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Create Care Receiver Account
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLinkButton}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    alignItems: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    padding: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 0,
  },
  sectionContent: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingLeft: 18,
    paddingRight: 8,
    minHeight: 52,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 10,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#60a5fa',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLinkButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    width: 280,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  menuItems: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  logoutText: {
    color: '#ef4444',
  },
  strengthContainer: {
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  strengthBarBackground: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  strengthText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
});

export default CareReceiverRegisterScreen;
