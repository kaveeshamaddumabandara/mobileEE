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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CaregiverTabParamList} from '../../navigation/types';
import {useAuth} from '../../context/AuthContext';
import ApiService from '../../services/api';
import {Caregiver, PendingContactChange} from '../../types';
import SideMenu from '../../components/SideMenu';
import {getWorkingHoursLabel} from '../../utils/bookingOverlap';

type CaregiverProfileScreenNavigationProp = NativeStackNavigationProp<
  CaregiverTabParamList,
  'Profile'
>;

const formatAddressValue = (userAddress: unknown): string => {
  if (typeof userAddress === 'object' && userAddress !== null) {
    const addrObj = userAddress as {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    return [addrObj.street, addrObj.city, addrObj.state, addrObj.zipCode]
      .filter(Boolean)
      .join(', ');
  }

  return typeof userAddress === 'string' ? userAddress : '';
};

const CaregiverProfileScreen: React.FC = () => {
  const navigation = useNavigation<CaregiverProfileScreenNavigationProp>();
  const {user, updateUser} = useAuth();
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
  const [workStartTime, setWorkStartTime] = useState('');
  const [workEndTime, setWorkEndTime] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [pendingContactChange, setPendingContactChange] =
    useState<PendingContactChange | null>(null);

  const loadProfile = React.useCallback(async () => {
    try {
      const data = (await ApiService.getProfile()) as Caregiver;
      setProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        bio: data.bio,
        skills: data.skills || [],
        rating: data.rating,
        totalReviews: data.totalReviews ?? 0,
      });
      setSpecializations(data.specialization || []);
      setLanguages(data.languages || []);
      setEducation(data.qualification || '');
      setCertifications(data.certificationsText || '');
      setAddress(formatAddressValue(data.address));
      setAvailability(data.availabilityType || '');
      setWorkStartTime(data.workStartTime || '');
      setWorkEndTime(data.workEndTime || '');
      setProfileImage(data.profileImage || user?.profileImage || null);
      setPendingContactChange(data.pendingContactChange || null);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user?.profileImage]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  const validateWorkingHours = (): boolean => {
    if (!workStartTime.trim() || !workEndTime.trim()) {
      Alert.alert('Error', 'Please enter your working hours');
      return false;
    }

    const workTimePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;
    if (!workTimePattern.test(workStartTime.trim()) || !workTimePattern.test(workEndTime.trim())) {
      Alert.alert('Error', 'Working hours must be in HH:MM format (e.g. 09:00 and 17:00)');
      return false;
    }

    const [startHour, startMinute] = workStartTime.trim().split(':').map(Number);
    const [endHour, endMinute] = workEndTime.trim().split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes <= startTotalMinutes) {
      Alert.alert('Error', 'Work end time must be after work start time');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateWorkingHours()) {
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        ...profile,
        qualification: education,
        specialization: specializations,
        languages: languages,
        certificationsText: certifications,
        workStartTime: workStartTime.trim(),
        workEndTime: workEndTime.trim(),
        address: address.trim(),
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

      updateUser({
        ...(user || {}),
        ...updatedUser,
        role: 'caregiver',
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: profileImage || updatedUser.profileImage,
      });

      setProfile(prev => ({
        ...prev,
        phone: updatedUser.phone || '',
      }));
      setAddress(formatAddressValue(updatedUser.address));
      setPendingContactChange(updatedUser.pendingContactChange || null);
      
      setIsEditing(false);
      Alert.alert(
        'Success',
        updatedUser.contactChangeSubmitted
          ? 'Profile saved. Phone or address changes were submitted for admin approval. Your current contact details remain active until approved.'
          : 'Profile updated successfully',
      );
      await loadProfile();
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
        {pendingContactChange && (
          <View style={styles.pendingBanner}>
            <Icon name="clock" size={18} color="#b45309" />
            <View style={styles.pendingBannerContent}>
              <Text style={styles.pendingBannerTitle}>
                Contact update awaiting admin approval
              </Text>
              {pendingContactChange.pendingPhone ? (
                <Text style={styles.pendingBannerText}>
                  Requested phone: {pendingContactChange.pendingPhone}
                </Text>
              ) : null}
              {pendingContactChange.pendingAddressLabel ? (
                <Text style={styles.pendingBannerText}>
                  Requested address: {pendingContactChange.pendingAddressLabel}
                </Text>
              ) : null}
              <Text style={styles.pendingBannerHint}>
                Your current phone and address stay active until the admin approves.
              </Text>
            </View>
          </View>
        )}

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
                <Text style={styles.ratingText}>
                  {(profile.rating ?? 0) > 0
                    ? profile.rating!.toFixed(1)
                    : 'N/A'}
                </Text>
                <Text style={styles.ratingCount}>
                  ({profile.totalReviews ?? 0}{' '}
                  {(profile.totalReviews ?? 0) === 1 ? 'review' : 'reviews'})
                </Text>
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

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
              />
            ) : (
              <Text style={styles.infoValue}>{address || 'Not provided'}</Text>
            )}
          </View>
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
                  setProfile({...profile, experience: parseInt(text, 10) || 0})
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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="clock" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Working Hours</Text>
            </View>
            <Text style={styles.sectionHint}>
              These hours are shown to care receivers when they book your services.
            </Text>
          </View>

          <View style={styles.workingHoursRow}>
            <View style={styles.workingHoursField}>
              <Text style={styles.infoLabel}>Work Start Time</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={workStartTime}
                  onChangeText={setWorkStartTime}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {workStartTime || 'Not set'}
                </Text>
              )}
            </View>

            <View style={styles.workingHoursField}>
              <Text style={styles.infoLabel}>Work End Time</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={workEndTime}
                  onChangeText={setWorkEndTime}
                  placeholder="17:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {workEndTime || 'Not set'}
                </Text>
              )}
            </View>
          </View>

          {!isEditing && getWorkingHoursLabel(workStartTime, workEndTime) && (
            <Text style={styles.workingHoursSummary}>
              Available: {getWorkingHoursLabel(workStartTime, workEndTime)}
            </Text>
          )}

          {isEditing && (
            <Text style={styles.inputHint}>Use 24-hour format (HH:MM), e.g. 09:00 and 17:00</Text>
          )}
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
    paddingBottom: 100, // Space for floating tab bar
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  workingHoursRow: {
    flexDirection: 'row',
    gap: 12,
  },
  workingHoursField: {
    flex: 1,
  },
  workingHoursSummary: {
    marginTop: 12,
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 10,
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
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pendingBannerContent: {
    flex: 1,
  },
  pendingBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  pendingBannerText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
  },
  pendingBannerHint: {
    fontSize: 12,
    color: '#a16207',
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
