import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import ApiService from '../../services/api';
import {Caregiver} from '../../types';
import SideMenu from '../../components/SideMenu';

type CaregiverProfileScreenNavigationProp = NativeStackNavigationProp<
  CaregiverTabParamList,
  'Profile'
>;

const CaregiverProfileScreen: React.FC = () => {
  const navigation = useNavigation<CaregiverProfileScreenNavigationProp>();
  const {user, updateUser, logout} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<Caregiver>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    experience: 0,
    hourlyRate: 0,
    bio: '',
    skills: [],
  });
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [education, setEducation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [address, setAddress] = useState('');
  const [availability, setAvailability] = useState('');
  const [hasTransportation, setHasTransportation] = useState(false);
  const [travelRadius, setTravelRadius] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await ApiService.getProfile() as Caregiver;
      setProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        bio: data.bio,
        skills: data.skills || [],
      });
      // Load additional fields from user data
      setSpecializations(data.specialization || []);
      setLanguages(data.languages || []);
      setEducation(data.qualification || '');
      setCertifications(data.certificationsText || '');
      // Format address if it's an object
      const userAddress = user?.address || data.address;
      if (typeof userAddress === 'object' && userAddress !== null) {
        const addrObj = userAddress as any;
        const addressParts = [
          addrObj.street,
          addrObj.city,
          addrObj.state,
          addrObj.zipCode
        ].filter(Boolean);
        setAddress(addressParts.join(', '));
      } else {
        setAddress(userAddress || '');
      }
      setAvailability(data.availabilityType || '');
      setHasTransportation(data.hasTransportation || false);
      setTravelRadius(data.travelRadius || '');
      setProfileImage(data.profileImage || user?.profileImage || null);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleImagePick = async () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImageSelection('camera'),
        },
        {
          text: 'Choose from Library',
          onPress: () => handleImageSelection('library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const handleImageSelection = async (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 800,
      maxHeight: 800,
    };

    const callback = async (response: any) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', 'Failed to get image: ' + response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0].uri) {
        const localUri = response.assets[0].uri;
        
        // Show loading state while uploading
        setLoading(true);
        try {
          console.log('Uploading image from:', localUri);
          // Upload image to server
          const uploadResult = await ApiService.uploadImage(localUri);
          console.log('Upload result:', uploadResult);
          
          if (uploadResult.success && uploadResult.data?.url) {
            const imageUrl = uploadResult.data.url;
            console.log('Setting profile image URL:', imageUrl);
            setProfileImage(imageUrl);
            Alert.alert('Success', 'Image uploaded! Click Save to update your profile.');
          } else {
            Alert.alert('Error', uploadResult.message || 'Failed to upload image');
          }
        } catch (error: any) {
          console.error('Image upload error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image. Please check your connection.';
          Alert.alert('Upload Error', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const addSkill = () => {
    if (!isEditing) return;
    if (skillInput.trim()) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        ...profile,
        qualification: education,
        specialization: specializations,
        languages: languages,
        certificationsText: certifications,
      };

      // Include profile image if it exists
      if (profileImage) {
        // Check if it's already a server URL (starts with http)
        if (profileImage.startsWith('http')) {
          updateData.profileImage = profileImage;
        } else {
          Alert.alert('Error', 'Please wait for image upload to complete');
          setLoading(false);
          return;
        }
      }

      const updatedUser = await ApiService.updateCaregiverProfile(updateData);
      
      // Update user context with new profile image
      if (profileImage) {
        updateUser({...updatedUser, profileImage: profileImage});
      } else {
        updateUser(updatedUser);
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
      
      // Keep the current profileImage in state instead of reloading
      // This ensures the uploaded image stays visible
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = (index: number) => {
    if (!isEditing) return;
    setProfile(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Save profile
      handleSave();
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Side Menu */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      {/* Header with Menu */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={isEditing ? handleImagePick : undefined}
              disabled={!isEditing}>
              {profileImage ? (
                <Image source={{uri: profileImage}} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {profile.name?.charAt(0).toUpperCase() || 'C'}
                </Text>
              )}
              {isEditing && (
                <View style={styles.cameraIconBadge}>
                  <Icon name="camera" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name || 'Caregiver'}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>4.9</Text>
                <Text style={styles.ratingCount}>(80 reviews)</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={toggleEdit}
            disabled={loading}>
            <Icon name={isEditing ? 'save' : 'edit-2'} size={18} color="#8b5cf6" />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={text => setProfile({...profile, name: text})}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.infoValue}>{profile.name || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={text => setProfile({...profile, phone: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{profile.phone || 'Not provided'}</Text>
            )}
          </View>

          {address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Years of Experience</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.experience?.toString() || ''}
                onChangeText={text =>
                  setProfile({...profile, experience: parseInt(text) || 0})
                }
                placeholder="Years of experience"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>
                {profile.experience ? `${profile.experience} years` : 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hourly Rate</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.hourlyRate?.toString() || ''}
                onChangeText={text =>
                  setProfile({...profile, hourlyRate: parseFloat(text) || 0})
                }
                placeholder="Your hourly rate in LKR"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>
                {profile.hourlyRate ? `LKR ${profile.hourlyRate.toLocaleString()}` : 'Not set'}
              </Text>
            )}
          </View>

          {availability && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Availability</Text>
              <Text style={styles.infoValue}>
                {availability.charAt(0).toUpperCase() + availability.slice(1)}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={text => setProfile({...profile, bio: text})}
                placeholder="Tell clients about yourself"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.infoValueMultiline}>
                {profile.bio || 'No bio provided'}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Skills</Text>
            {isEditing && (
              <View style={styles.skillInputRow}>
                <TextInput
                  style={[styles.input, styles.skillInput]}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  placeholder="Add a skill"
                />
                <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.skillsContainer}>
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                    {isEditing && (
                      <TouchableOpacity onPress={() => removeSkill(index)}>
                        <Text style={styles.removeSkillText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No skills added</Text>
              )}
            </View>
          </View>
        </View>

        {/* Qualifications */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Qualifications</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Education</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={education}
                onChangeText={setEducation}
                placeholder="Your highest qualification"
              />
            ) : (
              <Text style={styles.infoValue}>{education || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Specializations</Text>
            {!isEditing && specializations.length === 0 ? (
              <Text style={styles.emptyText}>No specializations added</Text>
            ) : (
              <View style={styles.skillsContainer}>
                {specializations.map((spec, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{spec}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Languages</Text>
            {!isEditing && languages.length === 0 ? (
              <Text style={styles.emptyText}>No languages added</Text>
            ) : (
              <View style={styles.skillsContainer}>
                {languages.map((lang, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{lang}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Certifications & Licenses</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Certifications</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={certifications}
                onChangeText={setCertifications}
                placeholder="List your certifications"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.infoValueMultiline}>
                {certifications || 'No certifications provided'}
              </Text>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#e9d5ff',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#8b5cf6',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
  },
  editButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  cardHeader: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  skillInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  skillText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
  },
  certificationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  certificationText: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '500',
  },
  removeSkillText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoValueMultiline: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CaregiverProfileScreen;
