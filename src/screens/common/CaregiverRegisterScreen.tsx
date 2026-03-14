import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import Icon from 'react-native-vector-icons/Feather';
import ApiService from '../../services/api';
import {useAuth} from '../../context/AuthContext';

type CaregiverRegisterScreenProps = {
  navigation: NativeStackNavigationProp<
    AuthStackParamList,
    'CaregiverRegister'
  >;
};

const CaregiverRegisterScreen: React.FC<CaregiverRegisterScreenProps> = ({
  navigation,
}) => {
  const {logout} = useAuth();
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    yearsOfExperience: '',
    specializations: [] as string[],
    certifications: '',
    education: '',
    availability: '',
    hourlyRate: '',
    bio: '',
    languages: [] as string[],
    hasTransportation: '',
    travelRadius: '',
    proofDocuments: [] as any[],
  });

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

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.includes(specialization)
        ? formData.specializations.filter(s => s !== specialization)
        : [...formData.specializations, specialization]
    });
  };

  const handleLanguageToggle = (language: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.includes(language)
        ? formData.languages.filter(l => l !== language)
        : [...formData.languages, language]
    });
  };

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    
    switch(option) {
      case 'about':
        Alert.alert('About Us', 'ElderEase connects caregivers with those who need compassionate care. Our platform makes it easy to find trusted professionals.');
        break;
      case 'contact':
        navigation.navigate('ContactUs');
        break;
      case 'help':
        Alert.alert('Help', 'Need assistance? Visit our help center or contact support.\n\nCommon topics:\n• Account setup\n• Registration process\n• Payment methods');
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

  const handleDocumentPick = () => {
    // Simulate document picker - In production, use react-native-document-picker
    Alert.alert(
      'Select Documents',
      'Choose documents to upload',
      [
        {
          text: 'Add Document',
          onPress: () => {
            // Simulate adding a document
            const newDoc = {
              name: `Document_${formData.proofDocuments.length + 1}.pdf`,
              type: 'application/pdf',
              size: Math.floor(Math.random() * 1000000),
            };
            setFormData({
              ...formData,
              proofDocuments: [...formData.proofDocuments, newDoc],
            });
            Alert.alert('Success', `${newDoc.name} added successfully`);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRemoveDocument = (index: number) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newDocs = formData.proofDocuments.filter((_, i) => i !== index);
            setFormData({
              ...formData,
              proofDocuments: newDocs,
            });
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (passwordStrength < 3) {
      Alert.alert('Weak Password', 'Please use a stronger password with a mix of uppercase, lowercase, numbers, and special characters.');
      return;
    }
    if (!formData.phone || !formData.dateOfBirth) {
      Alert.alert('Error', 'Please enter phone number and date of birth');
      return;
    }
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      Alert.alert('Error', 'Please complete your address information');
      return;
    }
    if (formData.specializations.length === 0) {
      Alert.alert('Error', 'Please select at least one specialization');
      return;
    }
    if (formData.languages.length === 0) {
      Alert.alert('Error', 'Please select at least one language');
      return;
    }
    if (!formData.yearsOfExperience || !formData.hourlyRate || !formData.availability) {
      Alert.alert('Error', 'Please complete your professional information');
      return;
    }
    if (!formData.education || !formData.bio) {
      Alert.alert('Error', 'Please complete your qualifications and bio');
      return;
    }
    if (!formData.hasTransportation || !formData.travelRadius) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for backend
      const registrationData = {
        role: 'caregiver' as 'caregiver',
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        specializations: formData.specializations,
        certifications: formData.certifications,
        education: formData.education,
        availability: formData.availability,
        hourlyRate: parseFloat(formData.hourlyRate),
        bio: formData.bio,
        languages: formData.languages,
        hasTransportation: formData.hasTransportation === 'yes',
        travelRadius: formData.travelRadius,
      };

      // Call the registration API
      const response = await ApiService.register(registrationData);
      
      setLoading(false);
      
      Alert.alert(
        'Success',
        'Your caregiver account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login or dashboard based on auto-login
              // Since register returns token and user, the app will auto-navigate
              // through the RootNavigator
            },
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const specializationOptions = [
    'Personal Care',
    'Dementia Care',
    'Physical Therapy',
    'Meal Preparation',
    'Medication Management',
    'Companionship',
    'Mobility Assistance',
    'Post-Surgery Care',
  ];

  const languageOptions = [
    'English',
    'Sinhala',
    'Tamil',
    'Other',
  ];

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
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Join as a Caregiver</Text>
          <Text style={styles.subtitle}>Create your professional profile</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="user" size={22} color="#9333ea" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={value => handleChange('firstName', value)}
                  placeholder="John"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={value => handleChange('lastName', value)}
                  placeholder="Doe"
                />
              </View>
            </View>

            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={value => handleChange('dateOfBirth', value)}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={value => handleChange('phone', value)}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="map-pin" size={22} color="#9333ea" />
              <Text style={styles.sectionTitle}>Address</Text>
            </View>

            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={value => handleChange('address', value)}
              placeholder="123 Main St"
            />

            <View style={styles.row}>
              <View style={styles.thirdInput}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={value => handleChange('city', value)}
                  placeholder="City"
                />
              </View>
              <View style={styles.thirdInput}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={value => handleChange('state', value)}
                  placeholder="State"
                />
              </View>
              <View style={styles.thirdInput}>
                <Text style={styles.label}>Postal Code *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zipCode}
                  onChangeText={value => handleChange('zipCode', value)}
                  placeholder="12345"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Account Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lock" size={22} color="#9333ea" />
              <Text style={styles.sectionTitle}>Account Security</Text>
            </View>

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={value => handleChange('email', value)}
              placeholder="john.doe@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={value => handleChange('password', value)}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}>
                <Icon 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={22} 
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

            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={value => handleChange('confirmPassword', value)}
                placeholder="••••••••"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}>
                <Icon 
                  name={showConfirmPassword ? "eye" : "eye-off"} 
                  size={22} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Professional Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="briefcase" size={22} color="#9333ea" />
              <Text style={styles.sectionTitle}>Professional Information</Text>
            </View>

            <Text style={styles.label}>Years of Experience *</Text>
            <TextInput
              style={styles.input}
              value={formData.yearsOfExperience}
              onChangeText={value => handleChange('yearsOfExperience', value)}
              placeholder="5"
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Specializations *</Text>
            <View style={styles.checkboxGrid}>
              {specializationOptions.map(spec => (
                <TouchableOpacity
                  key={spec}
                  style={[
                    styles.checkbox,
                    formData.specializations.includes(spec) &&
                      styles.checkboxSelected,
                  ]}
                  onPress={() => handleSpecializationToggle(spec)}>
                  <View
                    style={[
                      styles.checkboxIcon,
                      formData.specializations.includes(spec) &&
                        styles.checkboxIconSelected,
                    ]}>
                    {formData.specializations.includes(spec) && (
                      <Icon name="check" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>{spec}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Hourly Rate *</Text>
            <TextInput
              style={styles.input}
              value={formData.hourlyRate}
              onChangeText={value => handleChange('hourlyRate', value)}
              placeholder="25.00"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Availability *</Text>
            <View style={styles.pickerContainer}>
              {['Full-time', 'Part-time', 'Weekends only', 'Flexible'].map(
                option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.pickerOption,
                      formData.availability === option.toLowerCase() &&
                        styles.pickerOptionSelected,
                    ]}
                    onPress={() =>
                      handleChange('availability', option.toLowerCase())
                    }>
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.availability === option.toLowerCase() &&
                          styles.pickerOptionTextSelected,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>

            <Text style={styles.label}>Languages Spoken *</Text>
            <View style={styles.checkboxGrid}>
              {languageOptions.map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.checkbox,
                    formData.languages.includes(lang) &&
                      styles.checkboxSelected,
                  ]}
                  onPress={() => handleLanguageToggle(lang)}>
                  <View
                    style={[
                      styles.checkboxIcon,
                      formData.languages.includes(lang) &&
                        styles.checkboxIconSelected,
                    ]}>
                    {formData.languages.includes(lang) && (
                      <Icon name="check" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Reliable Transportation? *</Text>
            <View style={styles.pickerContainer}>
              {[
                {label: 'Yes, I have my own vehicle', value: 'yes'},
                {label: 'No, I use public transport', value: 'no'},
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    formData.hasTransportation === option.value &&
                      styles.pickerOptionSelected,
                  ]}
                  onPress={() =>
                    handleChange('hasTransportation', option.value)
                  }>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      formData.hasTransportation === option.value &&
                        styles.pickerOptionTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Willing to Travel (miles) *</Text>
            <View style={styles.pickerContainer}>
              {['5', '10', '15', '20', '25+'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pickerOption,
                    formData.travelRadius === option &&
                      styles.pickerOptionSelected,
                  ]}
                  onPress={() => handleChange('travelRadius', option)}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      formData.travelRadius === option &&
                        styles.pickerOptionTextSelected,
                    ]}>
                    Within {option} miles
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Qualifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="award" size={22} color="#9333ea" />
              <Text style={styles.sectionTitle}>Qualifications</Text>
            </View>

            <Text style={styles.label}>Education *</Text>
            <TextInput
              style={styles.input}
              value={formData.education}
              onChangeText={value => handleChange('education', value)}
              placeholder="E.g., Certified Nursing Assistant (CNA)"
            />

            <Text style={styles.label}>Certifications & Licenses</Text>
            <TextInput
              style={styles.textArea}
              value={formData.certifications}
              onChangeText={value => handleChange('certifications', value)}
              placeholder="List your certifications, licenses, and special training"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Upload Proof Documents *</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleDocumentPick}>
              <Icon name="upload" size={20} color="#9333ea" />
              <Text style={styles.uploadButtonText}>
                {formData.proofDocuments.length > 0 
                  ? `${formData.proofDocuments.length} Document(s) Selected` 
                  : 'Choose Files'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.uploadHint}>
              Upload certificates, licenses, or ID proof (PDF, JPG, PNG) - Multiple files allowed
            </Text>

            {/* Document List */}
            {formData.proofDocuments.length > 0 && (
              <View style={styles.documentList}>
                {formData.proofDocuments.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      <Icon name="file-text" size={18} color="#9333ea" />
                      <Text style={styles.documentName} numberOfLines={1}>
                        {doc.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveDocument(index)}
                      style={styles.removeButton}>
                      <Icon name="x" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Professional Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="file-text" size={22} color="#9333ea" />
              <Text style={styles.sectionTitle}>Professional Profile</Text>
            </View>

            <Text style={styles.label}>Professional Bio *</Text>
            <TextInput
              style={styles.textArea}
              value={formData.bio}
              onChangeText={value => handleChange('bio', value)}
              placeholder="Tell us about your experience, approach to care, and what makes you a great caregiver..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Create Caregiver Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#9333ea',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    lineHeight: 24,
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
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
    marginTop: 16,
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
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    minWidth: '48%',
  },
  checkboxSelected: {
    borderColor: '#9333ea',
    backgroundColor: '#f3e8ff',
    shadowColor: '#9333ea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  checkboxIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIconSelected: {
    borderColor: '#9333ea',
    backgroundColor: '#9333ea',
  },
  checkboxText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  pickerContainer: {
    marginTop: 8,
    gap: 8,
  },
  pickerOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pickerOptionSelected: {
    borderColor: '#9333ea',
    backgroundColor: '#9333ea',
    shadowColor: '#9333ea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#9333ea',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#9333ea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#c084fc',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 19,
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
    color: '#9333ea',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e8ff',
    borderWidth: 2,
    borderColor: '#9333ea',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#9333ea',
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  documentList: {
    marginTop: 16,
    gap: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    padding: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
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

export default CaregiverRegisterScreen;
